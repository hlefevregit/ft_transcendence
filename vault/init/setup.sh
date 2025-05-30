#!/bin/bash

set -euo pipefail

# Check Vault availability
curl -ks "$VAULT_ADDR/v1/sys/health" || {
  echo "Vault is not reachable at $VAULT_ADDR. Please check the address and try again."
  exit 1
}

echo "🔄 Waiting for Vault to be reachable..."
until curl -ks "$VAULT_ADDR/v1/sys/health" | grep -qE '"initialized":'; do
  sleep 1
done
echo "✅ Vault is reachable."

# Initialize Vault
if [ ! -f "/vault/secrets/init.txt" ]; then
  echo "🔐 Initializing Vault..."
  export VAULT_FILLED="false"
  vault operator init -key-shares=1 -key-threshold=1 > /vault/secrets/init.txt
else
  echo "ℹ️ Vault already initialized."
fi

# Extract keys
grep 'Unseal Key 1:' /vault/secrets/init.txt | awk '{print $NF}' > /vault/secrets/unseal_key.txt
grep 'Initial Root Token:' /vault/secrets/init.txt | awk '{print $NF}' > /vault/secrets/root_token.txt

# Unseal Vault
echo "🔓 Unsealing Vault..."
vault operator unseal -address="$VAULT_ADDR" "$(cat /vault/secrets/unseal_key.txt)"

# Fill Vault if not already filled
if [ "${VAULT_FILLED}" != "true" ]; then
  echo "🔑 Logging into Vault..."
  vault login "$(cat /vault/secrets/root_token.txt)"

  VAULT_SECRET_PATH="cubbyhole/default"
  CMD_ARGS=""

  flush_secrets() {
    if [ -n "$CMD_ARGS" ]; then
      echo "📂 Writing to $VAULT_SECRET_PATH"
      eval vault kv put "$VAULT_SECRET_PATH" $CMD_ARGS
      echo "✅ Stored secrets at path: $VAULT_SECRET_PATH"
      CMD_ARGS=""
    fi
  }

  echo "📥 Reading secrets from .env..."
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="$(echo "$line" | sed 's/\r$//')"
    if [[ -z "$line" ]]; then
      continue
    fi
    if [[ "$line" =~ ^#([a-zA-Z0-9_/.-]+)$ ]]; then
      flush_secrets
      VAULT_SECRET_PATH="cubbyhole/${BASH_REMATCH[1]}"
      echo "➡️ Switched to path: $VAULT_SECRET_PATH"
      continue
    fi
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      CMD_ARGS+=" \"$key=$value\""
    else
      echo "⚠️ Invalid line: $line"
    fi
  done < /vault/secrets/.env

  flush_secrets
  echo "✅ All secrets stored."

  export VAULT_FILLED="true"
fi

> /vault/secrets/.env

echo "🏁 Vault initialized and unsealed."

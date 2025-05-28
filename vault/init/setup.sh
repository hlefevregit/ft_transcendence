#!/bin/bash

set -euo pipefail

curl -ks "$VAULT_ADDR/v1/sys/health" || {
  echo "Vault is not reachable at $VAULT_ADDR. Please check the address and try again."
  exit 1
}

echo "Waiting for Vault to be reachable..."
until curl -ks "$VAULT_ADDR/v1/sys/health" | grep -qE '"initialized":'; do
  sleep 1
done
echo "Vault is reachable."

if [ ! -f "/vault/secrets/init.txt" ]; then
  echo "Initializing Vault..."
  vault operator init -key-shares=1 -key-threshold=1 > /vault/secrets/init.txt
else
  echo "Vault already initialized."
fi

if [ -f "/vault/secrets/init.txt" ]; then
  grep 'Unseal Key 1:' /vault/secrets/init.txt | awk '{print $NF}' > /vault/secrets/unseal_key.txt
fi

if [ -f "/vault/secrets/init.txt" ]; then
  grep 'Initial Root Token:' /vault/secrets/init.txt | awk '{print $NF}' > /vault/secrets/root_token.txt
fi

echo "Unsealing Vault..."
vault operator unseal -address="$VAULT_ADDR" "$(cat /vault/secrets/unseal_key.txt)"

echo "Vault initialized and unsealed."

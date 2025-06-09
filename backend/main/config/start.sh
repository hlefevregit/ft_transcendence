#!/bin/bash

vault_export_to_env() {
  local secret_path="$1"
  local env_file=".env"

  if [[ -z "$secret_path" ]]; then
    echo "Error: No secret path provided to vault_export_to_env" >&2
    return 1
  fi

  if [[ -z "$VAULT_ADDR" ]]; then
    echo "Error: VAULT_ADDR is not set" >&2
    return 1
  fi

  if [[ -z "$VAULT_TOKEN" ]]; then
    echo "Error: VAULT_TOKEN is not set" >&2
    return 1
  fi

  local kv_path="v1/${secret_path}"

  echo "Fetching secrets from $VAULT_ADDR/$kv_path"

  local output
  output=$(curl -sSfk \
    --header "X-Vault-Token: $VAULT_TOKEN" \
    "$VAULT_ADDR/$kv_path") || {
      echo "Error: Unable to get secret at path '$secret_path'" >&2
      return 1
    }

  eval "$(echo "$output" | jq -r '.data | to_entries[] | "export \(.key)=\(.value)"')"
  echo "Secrets successfully exported to environment variables."
}

echo "Starting entrypoint script..."
vault_export_to_env "${VAULT_SECRET_PATH_GOOGLE}"
vault_export_to_env "${VAULT_SECRET_PATH_JWT}"

env > .env

npm install -g typescript ts-node ts-node-dev pm2 fastify

# Installe les dépendances, y compris nodemon
npm install

npm run dev

# npx ts-node src/server.ts

#!/bin/bash
set -e

# Setup user only if not already created
if [ ! -f "/usr/share/elasticsearch/config/.user_created" ]; then
  /usr/local/bin/setup-user.sh
  touch /usr/share/elasticsearch/config/.user_created
fi

# Start Elasticsearch using the default entrypoint
exec /usr/local/bin/docker-entrypoint.sh
    
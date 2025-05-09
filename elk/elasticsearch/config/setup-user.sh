#!/bin/bash

# Ajoute l'utilisateur elastic avec mot de passe "changeme" s'il n'existe pas
if [ ! -f /usr/share/elasticsearch/config/users ]; then
    bin/elasticsearch-users useradd elastic -p changeme -r superuser
fi

# Démarre Elasticsearch
exec /usr/local/bin/docker-entrypoint.sh eswrapper

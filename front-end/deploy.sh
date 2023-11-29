#!/bin/bash

# Trouver l'ID du conteneur Docker qui utilise le port 3000
container_id=$(docker ps --filter "publish=3000" -q)

# Vérifier si un conteneur a été trouvé
if [ -n "$container_id" ]; then
    echo "Suppression du conteneur utilisant le port 3000: $container_id"
    docker rm -f $container_id
else
    echo "Aucun conteneur trouvé utilisant le port 3000."
fi


docker build -t scapp-frontend src/front-end/.
docker run -d -p 3000:3000 scapp-frontend

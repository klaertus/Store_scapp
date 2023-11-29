#!/bin/bash

# Vérifier si un argument (ID de conteneur Docker) est fourni
if [ -z "$1" ]; then
  echo "Veuillez fournir un ID de conteneur Docker."
  exit 1
fi

DOCKERID=$1

# Supprimer le conteneur Docker spécifié
echo "Suppression du conteneur Docker avec ID: $DOCKERID"
docker rm -f $DOCKERID

# Construire une nouvelle image Docker
echo "Construction de la nouvelle image Docker pour scapp-cart"
docker build -t scapp-cart .

# Exécuter le conteneur Docker
echo "Démarrage du service cart-service"
docker run -d -p 3003:80 --name cart-service --link users-db --network scapp-net scapp-cart

echo "Le script a été exécuté avec succès."

#!/bin/bash

if [ "$2" == "-e" ]; then
    gcloud endpoints services deploy api.pb deployment/api_config.yaml
fi

# Publicamos la imagen en el registry del proyecto
export PROJECT_ID=`gcloud config list | grep project | sed 's/project = //'`;

docker build -t "gcr.io/$PROJECT_ID/textclassifier:1.0.$1" -f Dockerfile .;
gcloud docker -- push -- gcr.io/$PROJECT_ID/textclassifier:1.0.$1;

#Deployamos los pods


replaces="s/{.version}/$1/;";

cat ./deployment/deployment.yaml | sed -e "$replaces" | kubectl apply --namespace=$NAMESPACE -f -
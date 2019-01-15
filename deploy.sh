#!/bin/bash

if [ "$2" == "-e" ] || [ "$3" == "-e" ]; then
    gcloud endpoints services deploy ./Classify/api.pb ./Classify/deployment/api_config.yaml
    gcloud endpoints services deploy ./Train/api.pb ./Train/deployment/api_config.yaml
fi

if [ "$2" == "-d" ] || [ "$3" == "-d" ]; then
    # Publicamos la imagen en el registry del proyecto
    export PROJECT_ID=`gcloud config list | grep project | sed 's/project = //'`;

    docker build --no-cache -t "gcr.io/$PROJECT_ID/textclassifier:1.0.$1" -f ./Classify/Dockerfile ./Classify/;
    gcloud docker -- push -- gcr.io/$PROJECT_ID/textclassifier:1.0.$1;

    docker build --no-cache -t "gcr.io/$PROJECT_ID/modeltrainer:1.0.$1" -f ./Train/Dockerfile ./Train/;
    gcloud docker -- push -- gcr.io/$PROJECT_ID/modeltrainer:1.0.$1;

fi


#Deployamos los pods

replaces="s/{.version}/$1/;";

cat ./deployment/services.yaml | sed -e "$replaces" | kubectl apply --namespace=$NAMESPACE -f -

cat ./Classify/deployment/deployment.yaml | sed -e "$replaces" | kubectl apply --namespace=$NAMESPACE -f -

cat ./Train/deployment/deployment.yaml | sed -e "$replaces" | kubectl apply --namespace=$NAMESPACE -f -

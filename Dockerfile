
FROM node:8

ADD ./package.json /app/
ADD ./protos/ /app/protos
ADD ./src/ /app/src

WORKDIR /app

RUN npm install
ENTRYPOINT []

EXPOSE 50051
CMD ["npm", "start"]

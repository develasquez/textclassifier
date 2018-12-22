console.log("Server");
const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const redis = require("./controllers/redis");
const PORT = 50051;
const server = new grpc.Server();

async function main() {
    trainModel.getModel().then(async (model) => {
        server.addService(model.Train.service, {
            setModel: trainController.setModel,
            updateModel: trainController.updateModel,
            train: trainController.train,
            classify: trainController.classify
        });
        server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
        redis.init().then(() => {
            server.start();
            console.log("Server is running");
        });
        
    });
}

main();
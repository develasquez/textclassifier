console.log("Server");
const grpc = require('grpc');
const classifyModel = require('./models/classify');
const classifyController = require('./controllers/classify');
const redis = require("./controllers/redis");
const PORT = 50051;
const server = new grpc.Server();

async function main() {
    classifyModel.getModel().then(async (model) => {
        server.addService(model.Classify.service, {
            classify: classifyController.classify
        });
        server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
        redis.init().then(() => {
            server.start();
            console.log("Classify Server is running");
        });
    });
}

main();
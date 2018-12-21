const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
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
        server.start();
    });
}

main();
/*


*/
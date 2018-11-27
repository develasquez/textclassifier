const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const data = require('./data.json');
const Bayes = require('./controllers/bayes');
const PORT = 50051;
const server = new grpc.Server();

async function main() {
    trainModel.getModel().then(async (model) => {
        server.addService(model.Train.service, {
            setModel: trainController.setModel,
            updateModel: trainController.updateModel
        });
        server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
        server.start();

        const bayes = await Bayes.init();

        data.forEach((d) => {
            bayes.train(d.comentario, d.categoria);
        });
        const scores = await bayes.guess("Error del sistema");
        const winner = await bayes.extractWinner(scores);
        console.log({
            comentario: "Error del sistema",
            categoria: winner.label
        });



    });
}

main();
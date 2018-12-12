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

        //const bayes = Bayes.init();

        data.forEach((d) => {
            Bayes.train(d.comentario, d.categoria);
        });
        const scores = Bayes.guess("No esta claro el proceso para realizar el cambio");
        const winner = Bayes.extractWinner(scores);
        console.log({
            comentario: "Error del sistema",
            categoria: winner.label
        });



    });
}

main();
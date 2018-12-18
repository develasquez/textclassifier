const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const data = require('./data.json');
const lib = require('./controllers/bayes');
const redis = require('./controllers/redis');
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
    });
}

main();
/*

        redis.init().then(() => {
            const bayes = lib.Bayes;
            data.forEach(async (d) => {
                bayes.train(d.comentario, d.categoria);
            });
            const trainedModel = lib.localStorage.items;
            redis.set("trainedModel", JSON.stringify(trainedModel)).then(() => {
                redis.get("trainedModel").then((strTrainedModel) => {
                    const scores = bayes.guess("No esta claro el proceso para realizar el cambio", JSON.parse(strTrainedModel));
                    const winner = bayes.extractWinner(scores);
                    console.log({
                        comentario: "Error del sistema",
                        categoria: winner.label
                    });
                });
            });
        });
*/
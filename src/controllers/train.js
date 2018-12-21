const Datastore = require('@google-cloud/datastore');
const trainModel = require('../models/train');
const lib = require('./bayes');
const datastore = Datastore();

const Train = {
    setModel: (call, callback) => {
        const response = {};
        try {
            call.request.entriesList.map((e) => {
                datastore.save({
                    key: datastore.key(call.request.name, 'entries'),
                    data: e
                }).then((a, b) => { console.log(a, b) })
                    .catch((a, b) => { console.log(a, b) });
            });
            response.statusCode = 200;
            response.message = 'Success';
            callback(null, response);
        }
        catch (ex) {
            response.statusCode = 500;
            response.message = ex;
            callback(ex, response);
        }
    },
    updateModel: (call, callback) => {
        const response = new Object(trainModel.response);
        try {
            datastore.save({
                key: datastore.key(call.request.modelName, 'entries'),
                data: call.request.entry
            });
            response.statusCode = 200;
            response.message = 'Success';
            callback(null, response);
        }
        catch (ex) {
            response.statusCode = 500;
            response.message = ex;
            callback(ex, response);
        }
    },
    train: (call, callback) => {
        const response = new Object(trainModel.response);
        const modelName = call.request.name;
        try {
            const query = datastore
                .createQuery(modelName, 'entries');

            datastore.runQuery(query)
                .then((results) => {
                    redis.init().then(() => {
                        const bayes = lib.Bayes;
                        results.forEach(async (d) => {
                            bayes.train(d.comentario, d.categoria);
                        });
                        const trainedModel = lib.localStorage.items;
                        redis.set(modelName, JSON.stringify(trainedModel)).then(() => {
                            response.statusCode = 200;
                            response.message = 'Trained Success';
                            callback(null, response);
                        });
                    });
                });
        }
        catch (ex) {
            response.statusCode = 500;
            response.message = ex;
            callback(ex, response);
        }

    },
    classify: (call, callback) => {
        const modelName = call.request.modelName;
        const text = call.request.text;

        redis.get(modelName).then((strTrainedModel) => {
            const entry = new Object(trainModel.entry);
            const scores = bayes.guess(text, JSON.parse(strTrainedModel));
            const winner = bayes.extractWinner(scores);
            console.log({
                comentario: text,
                categoria: winner.label
            });
            response.statusCode = 200;
            response.message = winner.label;
            callback(null, response);

        });
    }
}

module.exports = Train;

/*
                "trainedModel"
                */
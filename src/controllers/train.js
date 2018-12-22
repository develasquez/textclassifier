const Datastore = require('@google-cloud/datastore');
const trainModel = require('../models/train');
const lib = require('./bayes');
const datastore = Datastore();
const redis = require("./redis");

const Train = {
    setModel: (call, callback) => {
        const response = {};
        try {
            call.request.entriesList.map((e) => {
                datastore.save({
                    key: datastore.key(call.request.name, 'entries'),
                    data: e
                })
                .then((a, b) => { console.log(a, b) })
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
        console.log("train");
        let time1 = new Date();
        const response = new Object(trainModel.response);
        const modelName = call.request.name;
        console.log(call.request);
        try {
            const query = datastore
                .createQuery(modelName);

            datastore.runQuery(query)
                .then((results) => {
                    let time2 = new Date();
                    console.log(`Db Read in ${time2 - time1} ms`);
                    const bayes = lib.Bayes;
                    results[0].forEach(async (d) => {
                        bayes.train(d.comment, d.category);
                    });
                    const trainedModel = lib.localStorage.items;
                    redis.set(modelName, JSON.stringify(trainedModel)).then(() => {
                        response.statusCode = 200;
                        response.message = 'Trained Success';
                        time2 = new Date();
                        console.log(`Model trained in ${time2 - time1} ms`);
                        callback(null, response);
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
        console.log("Classify");
        let time1 = new Date();
        const bayes = lib.Bayes;
        const modelName = call.request.modelName;
        const text = call.request.text;
        redis.get(modelName).then((strTrainedModel) => {
            const scores = bayes.guess(text, JSON.parse(strTrainedModel));
            const winner = bayes.extractWinner(scores);
            let time2 = new Date();
            console.log(`Classified in ${time2 - time1} ms`);
            callback(null, {
                comment: text,
                category: winner.label
            });
            
        });
    }
}

module.exports = Train;
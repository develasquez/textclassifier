const Datastore = require('@google-cloud/datastore');
const lib = require('./bayes');
const datastore = Datastore();
const redis = require("./redis");

const Classify = {
    getTrainedModel: (modelName) => new Promise((resolve, reject) => {
        const query = datastore
                .createQuery(`${modelName}-trained`);

            datastore.runQuery(query)
                .then((results) => {
                    resolve(JSON.parse(_.head(results) || []));
                });
    }),
    classify: (call, callback) => {
        console.log("Classify");
        let time1 = new Date();
        const bayes = lib.Bayes;
        const modelName = call.request.modelName;
        const text = call.request.text;
        redis.get(modelName)
            .then((strTrainedModel) => {
                guess(callback, text, strTrainedModel, bayes, time1);
            })
            .catch((ex) => {
                Classify.getTrainedModel().then((strTrainedModel) => {
                    guess(callback, text, strTrainedModel, bayes, time1);
                });
            });
    }
}
const guess = (callback, text, strTrainedModel, bayes, time1) => {
    try {
        const scores = bayes.guess(text, JSON.parse(strTrainedModel));
        const winner = bayes.extractWinner(scores);
        let time2 = new Date();
        console.log(`Classified in ${time2 - time1} ms`);
        callback(null, {
            comment: text,
            category: winner.label
        });
    }
    catch (ex) {
        callback(ex, null);
    }
}
module.exports = Classify;
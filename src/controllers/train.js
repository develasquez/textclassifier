const Datastore = require('@google-cloud/datastore');
const trainModel = require('../models/train');

const datastore = Datastore();

const Train = {
    setModel: (call, callback) => {
        const response = {};
        try {
            call.request.entriesList.map((e) => {
                datastore.save({
                    key: datastore.key(call.request.name, 'entries'),
                    data: e
                }).then((a,b) => { console.log(a,b)})
                .catch((a,b) => { console.log(a,b)});
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
        }
        catch (ex) {
            response.statusCode = 500;
            response.message = ex;
            callback(ex, response);
        }
    }
}

module.exports = Train;
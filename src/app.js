const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const PORT = 50051;
const server = new grpc.Server();
trainModel.getModel().then((model) => {
    /*
    server.addService(model.Train.service, {
        setModel: trainController.setModel,
        updateModel: trainController.updateModel
    });
    server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
    server.start();*/

    client(model);
});

function client(model) {
    var client = new model.Train(`104.197.113.13:443`,
        grpc.credentials.createInsecure());

    const messages = model.messages;
    const newModel = new messages.Model();
    const entry = new messages.Entry();
    entry.setComment("Hola2");
    entry.setCategory("cat2");
    newModel.setName("model1")
    newModel.setEntriesList([entry, entry, entry]);
    let time1 = new Date();
    client.setModel(newModel.toObject(), (err, response) => {
        let time2 = new Date();

        console.log(`in ${time2 -  time1} ms` ,response);
    });
}
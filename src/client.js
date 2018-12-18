const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const data = require('./data.json');
const PORT = 50051;
const server = new grpc.Server();
trainModel.getModel().then((model) => {

    var client = new model.Train(`104.197.113.13:443`,
        grpc.credentials.createInsecure());

    const messages = model.messages;
    const newModel = new messages.Model();
    
    const trainModel = [];

    data.forEach(element => {
        const entry = new messages.Entry();
        entry.setComment(element.comentario);
        entry.setCategory(element.categoria);
        trainModel.push(entry);
    });
    
    newModel.setName("selfprotection")

    newModel.setEntriesList(trainModel);
    let time1 = new Date();
    client.setModel(newModel.toObject(), (err, response) => {
        let time2 = new Date();

        console.log(`in ${time2 -  time1} ms` ,response);
    });
})
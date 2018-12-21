const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const data = require('./data.json');
const PORT = 50051;
const server = new grpc.Server();
const SERVER = '104.197.113.13:443';//'0.0.0.0:50051'; //
trainModel.getModel().then((model) => {
    try {
        var client = new model.Train(`${SERVER}`,
            grpc.credentials.createInsecure());
        const messages = model.messages;
        const newModel = new messages.Model();
        const text = new messages.Text();
        const catallog = process.argv[2];
        newModel.setName(catallog)
        text.setModelname(catallog);
        text.setText(process.argv[3]);
        let time1 = new Date();
        client.train(newModel.toObject(), (err, response) => {
            console.log(err);
            console.log(response);
            client.classify({ modelName: 'selfprotection', text: 'No me gusta que me atrasen los vuelos' }, (err, response) => {
                console.log(err);
                console.log(response);
                let time2 = new Date();
                console.log(`in ${time2 - time1} ms`, response);
            });
        });
    }
    catch (ex) {
        console.log(ex);
    }
})
/*
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
*/
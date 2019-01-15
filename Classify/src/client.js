const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const data = require('./data.json');
const PORT = 50050;
const server = new grpc.Server();
const SERVER = '34.73.185.96:' + PORT;//'0.0.0.0:50051'; //
trainModel.getModel().then((model) => {
    try {
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
    }
    catch (ex) {
        console.log(ex);
    }
})
/*
  var client = new model.Train(`${SERVER}`,
            grpc.credentials.createInsecure());
            let time1, time2;
        for (let index = 0; index < 10; index++) {
            time1 = new Date();
            client.classify({ modelName: process.argv[2], text: process.argv[3] }, (err, response) => {
                console.log(err);
                console.log(response);
                time2 = new Date();
                console.log(`Req in ${time2 - time1} ms`);
            });            
        }
        */
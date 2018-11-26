const grpc = require('grpc');
const trainModel = require('./models/train');
const trainController = require('./controllers/train');
const PORT = 50051;
const server = new grpc.Server();


const redis = require('redis');
const REDISHOST = process.env.REDISHOST || '10.0.0.3';
const REDISPORT = process.env.REDISPORT || 6379;

const client = redis.createClient(REDISPORT, REDISHOST);
client.on('connect', () => { console.log('Redis client connected'); });
client.on('error', err => console.error('ERR:REDIS:', err));

trainModel.getModel().then((model) => {
    server.addService(model.Train.service, {
        setModel: trainController.setModel,
        updateModel: trainController.updateModel
    });
    server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
    server.start();
});
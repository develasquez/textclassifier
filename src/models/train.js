const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const PROTO_PATH = path.join(__dirname, '../../protos/train.proto');
const messages = require('./train_pb');

const getModel = () => {
    return new Promise((resolve, reject) => {
        try{
        protoLoader.load(PROTO_PATH, {
                keepCase: true,
                longs: Number,
                enums: Number,
                defaults: true,
                oneofs: true
            }).then((services) => {
                const packageObject = grpc.loadPackageDefinition(services).train;
                resolve({
                    Train: packageObject.Train,
                    messages
                })
            });
        }
        catch(ex){
            reject(ex);
        }
    });
}

module.exports = {
    getModel
};


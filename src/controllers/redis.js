const redis = require('redis');
const REDISHOST = process.env.REDISHOST || '10.0.0.3';
const REDISPORT = process.env.REDISPORT || 6379;
const client = redis.createClient(REDISPORT, REDISHOST);

//const {promisify} = require('util');
//const getAsync = promisify(client.get).bind(client);
async function init() {
    return new Promise((resolve, reject) => {
        client.on('connect', () => {
            console.error('OK:REDIS:');
            resolve(true);
        });
        client.on('error', (err) => {
            console.error('ERR:REDIS:', err);
            reject(err);
        });

    });
}


async function set(key, value) {
    return new Promise((resolve, reject) => {
        client.set(key, value, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

async function get(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

module.exports = {
    get,
    set,
    init
}
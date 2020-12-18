require('dotenv').config();
const mongoose = require('mongoose');

const options = {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    poolSize: 5,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

module.exports = {
	name: 'mongoose',
	async start() {
        return await mongoose.connect(process.env.MONGO_URI, options);
    },
    MongoEventListeners() {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB - Connected');
        });    
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB - Disconnected');
        });    
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB - Reconnected');
        });    
        mongoose.connection.on('close', () => {
            console.log('MongoDB - Closed ');
        });
        mongoose.connection.on('error', error => {
            console.log(`MongoDB - Error: ${error}`);
        });
        process.on('SIGTERM', () => {
            console.log('A reiniciar o servidor');
            mongoose.connection.close();
            process.exit();
        })
    }
}
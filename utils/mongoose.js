require('dotenv').config();
const mongoose = require('mongoose');

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

module.exports = {
	name: 'mongoose',
	async start() {
        await mongoose.connect(process.env.MONGO_URI, options).catch(() => process.emit('SIGINT'));
        console.log('Ligação ao MongoDB iniciada.');
    },

    disconnect() {
        mongoose.connection.close();
        console.log('Ligação ao MongoDB terminada.');
    }
}
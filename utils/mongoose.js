import mongoose from 'mongoose';

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

const connect = async() => {
    await mongoose.connect(process.env.MONGO_URI, options).catch(() => process.emit('SIGINT'));
    console.log('Connected to database.');
}

const disconnect = () => {
    mongoose.connection.close();
    console.log('Disconnected from database.');
}

export { connect, disconnect };
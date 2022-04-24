import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from '../utils/logger';
import { DatabaseError } from '../errors/databaseError';

export const connect = async () => {
	const options = {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	} as ConnectOptions;

	await mongoose.connect(process.env.MONGO_URI!, options).catch(() => {
		throw new DatabaseError('Failed to connect to database.');
	});

	logger.info('Connected to database successfully.');
};

export const disconnect = () => {
	const state = mongoose.STATES[mongoose.connection.readyState];
	if (state === 'disconnected') return;

	mongoose.connection.close();

	logger.info('Disconnected from database successfully.');
};

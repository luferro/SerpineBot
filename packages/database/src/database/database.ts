import { logger } from '@luferro/shared-utils';
import type { ConnectOptions } from 'mongoose';
import mongoose from 'mongoose';

export const connect = async (uri: string) => {
	const options = {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	} as ConnectOptions;

	try {
		await mongoose.connect(uri, options);
		logger.info('Connected to database successfully.');
	} catch (error) {
		throw new Error('Failed to connect to database.');
	}
};

export const disconnect = () => {
	const state = mongoose.STATES[mongoose.connection.readyState];
	if (state === 'disconnected') return;

	mongoose.connection.close();
	logger.info('Disconnected from database successfully.');
};

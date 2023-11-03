import { logger } from '@luferro/shared-utils';
import mongoose from 'mongoose';

export const connect = async (uri: string) => {
	await mongoose.connect(uri);
	logger.info('Connected to database successfully.');
};

export const disconnect = () => {
	const state = mongoose.STATES[mongoose.connection.readyState];
	if (state === 'disconnected') return;

	mongoose.connection.close();
	logger.info('Disconnected from database successfully.');
};

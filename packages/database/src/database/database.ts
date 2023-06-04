import { logger } from '@luferro/shared-utils';
import type { ConnectOptions } from 'mongoose';
import mongoose from 'mongoose';

export const connect = async (uri: string) => {
	await mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true } as ConnectOptions);
	logger.info('Connected to database successfully.');
};

export const disconnect = () => {
	const state = mongoose.STATES[mongoose.connection.readyState];
	if (state === 'disconnected') return;

	mongoose.connection.close();
	logger.info('Disconnected from database successfully.');
};

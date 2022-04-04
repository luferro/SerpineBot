import pino from 'pino';

export const logger = pino({
    transport: {
        depthLimit: 20,
        target: 'pino-pretty',
        options: {
            translateTime: true,
            ignore: 'pid,hostname'
        }
    }
});
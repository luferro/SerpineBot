import { createLogger, format, transports } from 'winston';

const { colorize, combine, timestamp, printf } = format;

const stringFormatter = combine(
    timestamp(),
    printf(({ timestamp, level, message, stack }) => {
        const log = `${colorize().colorize(level, `[${timestamp}] ${level.toUpperCase()}:`)} \x1b[36m${message}\x1b[0m`;
    
        if(stack) return log.concat('\n').concat(stack);
        return log;
    })
);

export const logger = createLogger({
    transports: [
        new transports.Console({ format: stringFormatter })
    ]
});
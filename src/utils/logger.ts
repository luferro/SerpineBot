import { createLogger, format, transports } from 'winston';

const { colorize, combine, errors, timestamp, printf } = format;

const stringFormatter = combine(
    timestamp(),
    printf(({ timestamp, level, message, stack }) => {
        const colorizedMessage = message.replace(/\`(.*?)\`/g, '\x1b[36m$1\x1b[0m');
        const log = `${colorize().colorize(level, `[${timestamp}] ${level.toUpperCase()}:`)} ${colorizedMessage}`;
    
        if(stack) return log.concat('\n').concat(stack);
        return log;
    })
);

export const logger = createLogger({
    format: errors({ stack: true }),
    transports: [
        new transports.Console({ format: stringFormatter })
    ]
});
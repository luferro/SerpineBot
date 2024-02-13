import { createLogger, format, transports } from "winston";

export { type Logger } from "winston";

type Options = {
	/**
	 * Log level
	 * @default "debug"
	 */
	level?: string;
};

export const configureLogger = ({ level = "debug" }: Options = {}) => {
	const { colorize, combine, errors, timestamp, printf } = format;

	return createLogger({
		format: combine(
			errors({ stack: true }),
			timestamp(),
			printf(({ timestamp, level, message, stack }) => {
				const colorizedMessage =
					typeof message !== "string"
						? JSON.stringify(message, null, 4)
						: message.replace(/\*\*(.*?)\*\*/g, "\x1b[36m$1\x1b[0m");

				const log = `${colorize().colorize(level, `[${timestamp}] ${level.toUpperCase()}:`)} ${colorizedMessage}`;
				return stack && level === "error" ? `${log}\n${stack}` : log;
			}),
		),
		transports: [new transports.Console({ level })],
	});
};

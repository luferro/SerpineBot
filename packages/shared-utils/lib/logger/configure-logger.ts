import pino from "pino";

export { Logger } from "pino";

const isProduction = process.env.RUNTIME_ENV === "production";

const logger = pino({
	formatters: { level: (label) => ({ level: label.toUpperCase() }), bindings: () => ({}) },
	timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
	...(isProduction
		? { messageKey: "message", errorKey: "error", transport: { target: "pino/file" } }
		: { transport: { target: "pino-pretty", options: { colorize: true } } }),
});

type Options = {
	/**
	 * Log level
	 * @default "debug"
	 */
	level?: string;
	/**
	 * Sensitive information to be redacted
	 */
	redact?: string[];
};

export const configureLogger = ({ level = "debug", redact }: Options = {}) => {
	return logger.child({}, { level, redact });
};

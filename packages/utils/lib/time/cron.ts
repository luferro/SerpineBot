import parser from "cron-parser";

export function parseCronExpression(expression: string) {
	return parser.parseExpression(expression);
}

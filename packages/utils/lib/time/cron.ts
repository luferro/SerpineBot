import { CronExpressionParser } from "cron-parser";

export function parseCronExpression(expression: string) {
	return CronExpressionParser.parse(expression);
}

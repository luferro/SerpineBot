import { Listener } from "@sapphire/framework";
import { DiscordAPIError, HTTPError } from "discord.js";

export class ErrorListener extends Listener {
	public run(error: Error) {
		if (error instanceof DiscordAPIError) {
			this.container.logger.fatal({
				code: error.code,
				method: error.method,
				url: error.url,
				message: `[API ERROR] ${error.message}`,
				stack: error.stack,
			});
		} else if (error instanceof HTTPError) {
			this.container.logger.error({
				status: error.status,
				method: error.method,
				url: error.url,
				message: `[HTTP ERROR] ${error.message}`,
				stack: error.stack,
			});
		} else {
			this.container.logger.error(error);
		}
	}
}

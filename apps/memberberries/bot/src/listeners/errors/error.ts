import { Listener } from "@sapphire/framework";
import { DiscordAPIError, HTTPError } from "discord.js";

const NEWLINE = "\n";

export class UserListener extends Listener {
	public run(error: Error) {
		if (error instanceof DiscordAPIError) {
			this.container.logger.warn(
				`[API ERROR] [CODE: ${error.code}] ${error.message}${NEWLINE}            [PATH: ${error.method} ${error.url}]`,
			);
			this.container.logger.fatal(error.stack);
		} else if (error instanceof HTTPError) {
			this.container.logger.warn(
				`[HTTP ERROR] [CODE: ${error.status}] ${error.message}${NEWLINE}             [PATH: ${error.method} ${error.url}]`,
			);
			this.container.logger.error(error.stack);
		} else {
			this.container.logger.error(error);
		}
	}
}

import * as CommandsHandler from "~/handlers/commands.js";
import type { EventData, EventExecute } from "~/types/bot.js";

export const data: EventData = { type: "once" };

export const execute: EventExecute = async ({ client }) => {
	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await client.db.guild.findUnique({ where: { id: guildId } });
		if (!settings) client.emit("guildCreate", guild);
	}

	await CommandsHandler.deployCommands(client);
	client.logger.info("Bot | Ready to process interactions");

	client.emit("rolesMessageUpdate", client);
};

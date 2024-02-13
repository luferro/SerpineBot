import * as CommandsHandler from "../handlers/commands";
import type { EventData, EventExecute } from "../types/bot";

export const data: EventData = { type: "once" };

export const execute: EventExecute = async ({ client }) => {
	for (const [id, guild] of client.guilds.cache) {
		const settings = await client.prisma.guild.findUnique({ where: { id } });
		if (!settings) client.emit("guildCreate", guild);
	}

	await CommandsHandler.deployCommands(client);
	client.logger.info("Bot | Ready to process interactions");

	client.emit("rolesMessageUpdate", client);
};

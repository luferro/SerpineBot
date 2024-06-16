import type { Guild } from "discord.js";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [guild: Guild];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [guild] }) => {
	await client.db.guild.create({ data: { id: guild.id, roles: { channelId: null, options: [] } } });
	client.logger.info(`Settings | Created ${guild.name} config`);
};

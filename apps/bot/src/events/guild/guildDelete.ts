import type { Guild } from "discord.js";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [guild: Guild];

export const data: EventData = { listener: "discord", type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [guild] }) => {
	await client.db.guild.delete({ where: { id: guild.id } });
	client.logger.info(`Settings | Deleted ${guild.name} config`);
};

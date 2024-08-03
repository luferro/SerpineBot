import type { GuildQueue } from "discord-player";
import type { TextBasedChannel } from "discord.js";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [queue: GuildQueue<TextBasedChannel>, message: string];

export const data: EventData = { listener: "player", type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [_, message] }) => {
	client.logger.debug({ message });
};

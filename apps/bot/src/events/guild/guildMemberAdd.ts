import type { GuildMember } from "discord.js";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [member: GuildMember];

export const data: EventData = { listener: "discord", type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [member] }) => {
	client.logger.info(`User ${member.user.username} has joined guild ${member.guild.name}`);
};

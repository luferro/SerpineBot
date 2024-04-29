import type { GuildMember } from "discord.js";
import { Bot } from "~/structures/Bot.js";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [member: GuildMember];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ rest: [member] }) => {
	let role = member.guild.roles.cache.find((role) => role.name === Bot.RESTRICTIONS_ROLE);
	if (!role) {
		role = await member.guild.roles.create({
			name: Bot.RESTRICTIONS_ROLE,
			color: "Default",
			hoist: false,
			mentionable: false,
			position: member.guild.roles.cache.size + 1,
		});
	}
	await member.roles.add(role);
};

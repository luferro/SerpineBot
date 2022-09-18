import type { GuildMember } from 'discord.js';
import type { Bot } from '../structures/bot';
import * as Roles from '../services/roles';
import { EventName } from '../types/enums';
import { logger } from '../utils/logger';

export const data = {
	name: EventName.GuildMemberAdd,
	type: 'on',
};

export const execute = async (_client: Bot, member: GuildMember) => {
	let role = member.guild.roles.cache.find((role) => role.name === 'Restrictions');
	if (!role) role = await Roles.create(member.guild, 'Restrictions', 'Default', false, false);

	await member.roles.add(role);

	logger.info(`User _*${member.user.tag}*_ has joined guild _*${member.guild.name}*_.`);
};

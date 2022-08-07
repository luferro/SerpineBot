import { GuildMember } from 'discord.js';
import { Bot } from '../bot';
import * as Roles from '../services/roles';
import { EventName } from '../types/enums';
import { logger } from '../utils/logger';

export const data = {
	name: EventName.GuildMemberAdd,
	once: false,
};

export const execute = async (client: Bot, member: GuildMember) => {
	let role = member.guild.roles.cache.find((role) => role.name === 'Restrictions');
	if (!role) role = await Roles.create(member.guild, 'Restrictions', 'Default', false, false);

	await member.roles.add(role);

	logger.info(`User _*${member.user.tag}*_ has joined guild _*${member.guild.name}*_.`);
};

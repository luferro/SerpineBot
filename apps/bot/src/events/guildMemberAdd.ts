import type { GuildMember } from 'discord.js';
import type { Bot } from '../structures/bot';
import { logger } from '@luferro/shared-utils';
import * as Roles from '../services/roles';
import { EventName } from '../types/enums';

export const data = {
	name: EventName.GuildMemberAdd,
	type: 'on',
};

export const execute = async (_client: Bot, member: GuildMember) => {
	let role = member.guild.roles.cache.find((role) => role.name === 'Restrictions');
	if (!role) role = await Roles.create(member.guild, 'Restrictions', 'Default', false, false);

	await member.roles.add(role);

	logger.info(`User **${member.user.tag}** has joined guild **${member.guild.name}**.`);
};

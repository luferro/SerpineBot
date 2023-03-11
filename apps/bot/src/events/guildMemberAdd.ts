import { logger } from '@luferro/shared-utils';
import type { GuildMember } from 'discord.js';

import * as Roles from '../services/roles';
import type { Bot } from '../structures/bot';
import type { EventData } from '../types/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.GuildMemberAdd,
	type: 'on',
};

export const execute = async (_client: Bot, member: GuildMember) => {
	let role = member.guild.roles.cache.find((role) => role.name === 'Restrictions');
	if (!role) role = await Roles.createRole(member.guild, 'Restrictions', 'Default', false, false);

	await member.roles.add(role);

	logger.info(`**${member.user.tag}** has joined guild **${member.guild.name}**.`);
};

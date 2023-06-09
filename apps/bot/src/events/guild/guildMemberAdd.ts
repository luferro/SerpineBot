import { logger } from '@luferro/shared-utils';
import type { GuildMember } from 'discord.js';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [member: GuildMember];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ rest: [member] }) => {
	let role = member.guild.roles.cache.find((role) => role.name === 'Restrictions');
	if (!role) {
		role = await member.guild.roles.create({
			name: 'Restrictions',
			color: 'Default',
			hoist: false,
			mentionable: false,
			position: member.guild.roles.cache.size + 1,
		});
	}

	await member.roles.add(role);

	logger.info(`**${member.user.tag}** has joined guild **${member.guild.name}**.`);
};

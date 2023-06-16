import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { EventData, EventExecute } from '../../types/bot';
import { ExtendedStringSelectMenuInteraction } from '../../types/interaction';

type Args = [interaction: ExtendedStringSelectMenuInteraction];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [interaction] }) => {
	const guild = interaction.guild;
	const channel = interaction.channel;
	const member = interaction.member;
	if (member.user.bot || !channel?.isTextBased()) return;

	const granted = [];
	const revoked = [];
	for (const value of interaction.values) {
		const role = guild.roles.cache.find(({ id }) => id === value);
		if (!role) continue;

		const restrictionsRole = guild.roles.cache.find(({ name }) => name === 'Restrictions');
		if (restrictionsRole && member.roles.cache.has(restrictionsRole.id)) continue;

		if (!member.roles.cache.has(role.id)) {
			member.roles.add(role);
			granted.push(role.name);
			continue;
		}

		member.roles.remove(role);
		revoked.push(role.name);
	}

	const embed = new EmbedBuilder()
		.setTitle(`${granted.length} role(s) granted and ${revoked.length} role(s) revoked`)
		.addFields([
			{
				name: 'Granted',
				value: granted.join('\n') || 'None',
				inline: true,
			},
			{
				name: 'Revoked',
				value: revoked.join('\n') || 'None',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });

	const name = member.nickname ?? member.displayName;
	logger.info(`Roles updated for **${name}** in **${guild.name}** (+${granted.length} | -${revoked.length}).`);
	logger.debug({ granted, revoked });

	client.emit('rolesMessageUpdate', client);
};

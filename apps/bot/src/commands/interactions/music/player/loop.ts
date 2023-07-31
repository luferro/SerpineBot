import { EnumUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueueRepeatMode } from 'discord-player';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('loop')
	.setDescription('Sets a loop mode for the current track.')
	.addIntegerOption((option) =>
		option
			.setName('mode')
			.setDescription('Loop mode.')
			.setRequired(true)
			.addChoices(
				...EnumUtil.enumKeysToArray(QueueRepeatMode).map((mode) => ({
					name: mode,
					value: QueueRepeatMode[mode],
				})),
			),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const mode = interaction.options.getInteger('mode', true) as QueueRepeatMode;

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error('No track is playing.');

	queue.setRepeatMode(mode);

	const embed = new EmbedBuilder().setTitle(`Loop mode set to ${QueueRepeatMode[mode]}`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

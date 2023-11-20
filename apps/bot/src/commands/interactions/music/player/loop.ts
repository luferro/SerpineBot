import { ArrayUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueueRepeatMode } from 'discord-player';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.music.player.loop.name'))
	.setDescription(t('interactions.music.player.loop.description'))
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.music.player.loop.options.0.name'))
			.setDescription(t('interactions.music.player.loop.options.0.description'))
			.setRequired(true)
			.addChoices(
				...ArrayUtil.enumToArray(QueueRepeatMode).map((mode) => ({
					name: mode,
					value: QueueRepeatMode[mode],
				})),
			),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const mode = interaction.options.getInteger(data.options[0].name, true) as QueueRepeatMode;

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error(t('errors.player.playback.nothing'));

	queue.setRepeatMode(mode);

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.music.player.loop.embed.title', { mode: QueueRepeatMode[mode] }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

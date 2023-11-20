import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.music.player.skip.name'))
	.setDescription(t('interactions.music.player.skip.description'))
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.music.player.skip.options.0.name'))
			.setDescription(t('interactions.music.player.skip.options.0.description'))
			.setMinValue(1),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger(data.options[0].name);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t('errors.player.node'));
	if (queue.isEmpty()) throw new Error(t('errors.player.queue.empty'));
	if (!queue.currentTrack) throw new Error(t('errors.player.playback.nothing'));

	const currentTrack = queue.currentTrack;
	const nextTrack = queue.tracks.at(position ? position - 1 : 0);

	const isSuccessful = position ? queue.node.skipTo(position - 1) : queue.node.skip();
	if (!isSuccessful) throw new Error(t('errors.player.queue.tracks.position', { position: `\`${position}\`` }));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.music.player.skip.embed.title', { track: `\`${currentTrack}\`` }))
		.setDescription(t('interactions.music.player.skip.embed.description', { track: `\`${nextTrack}\`` }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

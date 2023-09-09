import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueryType } from 'discord-player';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.music.play.name'))
	.setDescription(t('interactions.music.play.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.music.play.options.0.name'))
			.setDescription(t('interactions.music.play.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const query = interaction.options.getString(t('interactions.music.play.options.0.name'), true);

	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) throw new Error(t('errors.voice.member.channel'));

	const {
		track,
		queue,
		searchResult: { playlist },
	} = await client.player.play(voiceChannel, query, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
		nodeOptions: { metadata: interaction.channel, ...client.connection.config },
	});

	const position = queue.node.getTrackPosition(playlist?.tracks[0] ?? track) + 1;
	const embed = new EmbedBuilder()
		.setAuthor({ name: playlist?.author.name ?? track.author })
		.setTitle(playlist?.title ?? track.title)
		.setURL(playlist?.url ?? track.url)
		.setThumbnail(playlist?.thumbnail ?? track.thumbnail)
		.addFields([
			{
				name: `**${t('music.play.embeds.1.fields.0.name')}**`,
				value: position === 0 ? t('common.player.playback.playing') : position.toString(),
				inline: true,
			},
			{
				name: `**${t('music.play.embeds.1.fields.1.name')}**`,
				value: playlist?.durationFormatted ?? track.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

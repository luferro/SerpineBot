import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueryType } from 'discord-player';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('play')
	.setDescription('Plays / enqueues track matching your query.')
	.addStringOption((option) => option.setName('query').setDescription('Track query.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const query = interaction.options.getString('query', true);

	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) throw new Error('You are not in a voice channel.');

	const {
		track,
		queue,
		searchResult: { playlist },
	} = await client.player.play(voiceChannel, query, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
		nodeOptions: {
			metadata: interaction.channel,
			...client.connection.config,
		},
	});

	const position = queue.node.getTrackPosition(playlist?.tracks[0] ?? track) + 1;
	const embed = new EmbedBuilder()
		.setAuthor({ name: playlist?.author.name ?? track.author })
		.setTitle(playlist?.title ?? track.title)
		.setURL(playlist?.url ?? track.url)
		.setThumbnail(playlist?.thumbnail ?? track.thumbnail)
		.addFields([
			{
				name: '**Position**',
				value: position === 0 ? 'Currently playing' : position.toString(),
				inline: true,
			},
			{
				name: '**Duration**',
				value: playlist?.durationFormatted ?? track.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
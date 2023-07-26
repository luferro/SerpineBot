import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueryType } from 'discord-player';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('play')
	.setDescription('Plays / enqueues track matching your query.')
	.addStringOption((option) => option.setName('query').setDescription('Track query.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const query = interaction.options.getString('query', true);

	const channel = interaction.member.voice.channel;
	if (!channel) throw new Error('You are not in a voice channel.');

	const {
		track,
		queue,
		searchResult: { playlist },
	} = await client.player.play(channel, query, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
		nodeOptions: {
			metadata: interaction.channel,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 1000 * 60 * 5,
			leaveOnEnd: false,
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

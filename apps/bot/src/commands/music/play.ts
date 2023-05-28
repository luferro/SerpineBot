import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueryType } from 'discord-player';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('play')
	.setDescription('Plays the first result matching your search query.')
	.addStringOption((option) => option.setName('query').setDescription('Youtube search query.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const queue = await forceJoin({ client, interaction });

	const { tracks, playlist } = await client.player.search(query, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
	});
	const filteredTracks = tracks.filter(({ duration }) => !/0?0:00/.test(duration));
	if (filteredTracks.length === 0 && !playlist) throw new Error(`No matches for "${query}".`);

	if (playlist) {
		queue.addTrack(playlist);
		if (!queue.node.isPlaying()) await queue.node.play();

		const playlistPositionStart = queue.node.getTrackPosition(playlist.tracks[0]) + 1;
		const playlistPositionEnd = queue.node.getTrackPosition(playlist.tracks[playlist.tracks.length - 1]) + 1;

		const embed = new EmbedBuilder()
			.setTitle(playlist.title)
			.setURL(playlist.url)
			.addFields([
				{
					name: '**Start position**',
					value: playlistPositionStart === 0 ? 'Currently playing' : playlistPositionStart.toString(),
					inline: true,
				},
				{
					name: '**End position**',
					value: playlistPositionEnd.toString(),
					inline: true,
				},
				{
					name: '**Channel**',
					value: playlist.author.name,
					inline: true,
				},
				{
					name: '**Count**',
					value: playlist.tracks.length.toString(),
					inline: true,
				},
			])
			.setColor('Random');

		await interaction.editReply({ embeds: [embed] });
		return;
	}

	const { 0: track } = filteredTracks;
	queue.addTrack(track);
	if (!queue.node.isPlaying()) await queue.node.play();

	const embed = new EmbedBuilder()
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.addFields([
			{
				name: '**Position in queue**',
				value: queue.tracks.size === 0 ? 'Currently playing' : queue.tracks.size.toString(),
				inline: true,
			},
			{
				name: '**Channel**',
				value: track.author,
				inline: true,
			},
			{
				name: '**Duration**',
				value: track.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

const forceJoin = async ({ client, interaction }: Parameters<typeof execute>[0]) => {
	let queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) {
		const memberVoiceChannel = interaction.member.voice.channel;
		if (!memberVoiceChannel) throw new Error('You are not in a voice channel.');

		queue = client.player.nodes.create(interaction.guild.id, { leaveOnEmptyCooldown: 1000 * 60 * 5 });
		await queue.connect(memberVoiceChannel);
	}
	return queue;
};

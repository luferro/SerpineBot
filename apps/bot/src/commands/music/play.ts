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

	const { tracks, playlist } = await client.player.search(query, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
	});
	const filteredTracks = tracks.filter(({ duration }) => !/0?0:00/.test(duration));
	if (!playlist && filteredTracks.length === 0) throw new Error(`No matches for "${query}".`);

	const queue = await forceJoin({ client, interaction });
	queue.addTrack(playlist ?? filteredTracks[0]);
	if (!queue.node.isPlaying()) await queue.node.play();

	const position = queue.node.getTrackPosition(playlist?.tracks[0] ?? filteredTracks[0]) + 1;

	const embed = new EmbedBuilder()
		.setAuthor({ name: playlist?.author.name ?? filteredTracks[0].author })
		.setTitle(playlist?.title ?? filteredTracks[0].title)
		.setURL(playlist?.url ?? filteredTracks[0].url)
		.setThumbnail(playlist?.thumbnail ?? filteredTracks[0].thumbnail)
		.addFields([
			{
				name: '**Position**',
				value: position === 0 ? 'Currently playing' : position.toString(),
				inline: true,
			},
			{
				name: '**Duration**',
				value: playlist?.durationFormatted ?? filteredTracks[0].duration,
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

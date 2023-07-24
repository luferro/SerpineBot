import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { Track } from 'discord-player';

import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('list')
	.setDescription('Lists the guild queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot display guild queue.');

	const { currentTrack, tracks } = queue;

	const getFormattedTrack = ({ track }: { track: Track }) => {
		const formattedTrack = [];

		const isPlaying = track.id === queue.currentTrack?.id;

		const baseTrackData = `**[${track.title}](${track.url})**`;
		const additionalTrackData = isPlaying ? `, *${track.author}*` : ` | **${track.duration}**`;
		formattedTrack.push(`${baseTrackData}${additionalTrackData}`);

		if (isPlaying) {
			const progressBar = queue.node.createProgressBar();
			formattedTrack.push(progressBar);
		}

		formattedTrack.push(`Request by \`${track.requestedBy?.username ?? 'unknown'}\``);
		return formattedTrack.join('\n');
	};

	const formattedQueue = tracks
		.toArray()
		.slice(0, 5)
		.map((track, index) => `\`${index + 1}.\` ${getFormattedTrack({ track })}`);

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${interaction.guild.name}`)
		.setThumbnail(interaction.guild.iconURL())
		.addFields([
			{
				name: '**Now playing**',
				value: currentTrack ? getFormattedTrack({ track: currentTrack }) : 'Nothing is playing.',
			},
			{
				name: '**Queue**',
				value: formattedQueue.join('\n') || 'Empty.',
			},
		])
		.setFooter({ text: `${queue.size} item(s) in queue.` })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

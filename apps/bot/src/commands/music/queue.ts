import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { PlayerTimestamp, Track } from 'discord-player';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('queue')
	.setDescription('Lists the guild queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot display guild queue.');

	const { currentTrack, tracks } = queue;

	const getFormattedTrack = ({ track, timestamp }: { track: Track; timestamp?: PlayerTimestamp | null }) => {
		const formattedTrack = [];
		const isPlaying = !!timestamp;

		const baseTrackData = `**[${track.title}](${track.url})**`;
		const additionalTrackData = isPlaying ? `, *${track.author}*` : ` | **${track.duration}**`;
		formattedTrack.push(`${baseTrackData}${additionalTrackData}`);

		if (isPlaying) {
			const { current, progress, total } = timestamp;
			const progressBar = getProgressBar({ progress, current: current.label, total: total.label });
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
				value: currentTrack
					? getFormattedTrack({ track: currentTrack, timestamp: queue.node.getTimestamp() })
					: 'Nothing is playing.',
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

const getProgressBar = ({ progress, current, total }: { progress: number; current: string; total: string }) => {
	const array = Array.from({ length: 20 });
	const bar = `[${array.map((_, index) => ((index * 100) / 20 < progress ? '=' : '-')).join('')}]`;
	return `\`${current}\` **${bar}** \`${total}\``;
};

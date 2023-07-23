import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { Track } from 'discord-player';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('queue')
	.setDescription('Lists the guild queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot display guild queue.');

	const { currentTrack, tracks } = queue;

	const getFormattedTrack = (currentTrack: Track) => {
		let row = `**[${currentTrack.title}](${currentTrack.url})**`;
		const timestamp = queue.node.getTimestamp();

		if (timestamp) {
			const progress = getProgressBar({
				progress: timestamp.progress,
				current: timestamp.current.label,
				total: timestamp.total.label,
			});
			row += `\n${progress}`;
		} else row += ` | **${currentTrack.duration}**`;

		if (currentTrack.requestedBy) row += `\nRequest by \`${currentTrack.requestedBy.username}\``;
		return row;
	};

	const formattedQueue = tracks
		.toArray()
		.slice(0, 5)
		.map((track, index) => `\`${index + 1}.\` ${getFormattedTrack(track)}`);

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${interaction.guild.name}`)
		.setThumbnail(interaction.guild.iconURL())
		.addFields([
			{
				name: '**Now playing**',
				value: currentTrack ? getFormattedTrack(currentTrack) : 'Nothing is playing.',
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

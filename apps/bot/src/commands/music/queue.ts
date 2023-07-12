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
	const timestamp = queue.node.getTimestamp();

	const getFormattedTrack = (currentTrack: Track, timestamp?: PlayerTimestamp) => {
		let formatted = `**[${currentTrack.title}](${currentTrack.url})**`;

		if (timestamp) {
			const progress = getProgressBar({
				progress: timestamp.progress,
				current: timestamp.current.label,
				total: timestamp.total.label,
			});
			formatted += `\n${progress}`;
		} else formatted += ` | **${currentTrack.duration}**`;

		if (currentTrack.requestedBy) formatted += `\nRequest by \`${currentTrack.requestedBy.username}\``;
		return formatted;
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
				value: currentTrack && timestamp ? getFormattedTrack(currentTrack, timestamp) : 'Nothing is playing.',
			},
			{
				name: '**Queue**',
				value: formattedQueue.join('\n') || 'Queue is empty.',
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

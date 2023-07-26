import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { Track } from 'discord-player';

import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('list')
	.setDescription('Lists the guild queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot display guild queue.');

	const formatTrack = (track: Track) => `**[${track.title}](${track.url})** | **${track.duration}**`;

	const formattedQueue = queue.tracks
		.toArray()
		.slice(0, 10)
		.map((track, index) => `\`${index + 1}.\` ${formatTrack(track)}`);

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${interaction.guild.name}`)
		.setThumbnail(interaction.guild.iconURL())
		.addFields([
			{
				name: '**Now playing**',
				value: queue.currentTrack ? formatTrack(queue.currentTrack) : 'Nothing is playing.',
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

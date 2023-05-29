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
		const title = `[${currentTrack.title}](${currentTrack.url})`;
		const duration = timestamp ? `${timestamp.current.label} / ${timestamp.total.label}` : currentTrack.duration;

		let formatted = `**${title}** | **${duration}**`;
		if (currentTrack.requestedBy) formatted = `${formatted}\nRequest by \`${currentTrack.requestedBy.tag}\``;
		return formatted;
	};

	const formattedQueue = tracks
		.toArray()
		.slice(0, 10)
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

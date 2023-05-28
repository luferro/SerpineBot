import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('queue')
	.setDescription('Lists the guild queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot display guild queue.');

	const { currentTrack, tracks } = queue;

	const formattedCurrentTrack = currentTrack
		? `**[${currentTrack.title}](${currentTrack.url})** | **${currentTrack.duration}**\nRequest by \`${
				currentTrack.requestedBy?.tag ?? 'Unknown'
		  }\``
		: 'Nothing is playing.';
	const formattedQueue = tracks
		.map(
			({ title, duration, requestedBy }, index) =>
				`\`${index + 1}.\` **${title}** | **${duration}**\nRequest by \`${requestedBy?.tag ?? 'Unknown'}\``,
		)
		.slice(0, 10);

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${interaction.guild.name}`)
		.addFields([
			{
				name: '**Now playing**',
				value: formattedCurrentTrack,
			},
			{
				name: '**Queue**',
				value: formattedQueue.join('\n') || 'Queue is empty.',
			},
		])
		.setFooter({ text: `${queue.size} total items in queue.` })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('history')
	.setDescription('Lists the guild queue history.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot display guild queue history.');

	const { history } = queue;

	const formattedHistory = history.tracks
		.toArray()
		.slice(0, 10)
		.map((track, index) => `\`${index + 1}.\` **[${track.title}](${track.url})** | **${track.duration}**`);

	const embed = new EmbedBuilder()
		.setTitle(`Queue history for ${interaction.guild.name}`)
		.setThumbnail(interaction.guild.iconURL())
		.addFields([
			{
				name: '**Queue history**',
				value: formattedHistory.join('\n') || 'Empty.',
			},
		])
		.setFooter({ text: `${history.tracks.size} item(s) in queue history.` })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

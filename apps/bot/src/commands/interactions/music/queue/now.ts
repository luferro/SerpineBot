import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('now')
	.setDescription('Lists track currently playing.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error('Cannot display current track.');

	const { previousTrack, currentTrack } = queue.history;
	const { author, title, url, thumbnail, requestedBy } = currentTrack!;

	const embed = new EmbedBuilder()
		.setAuthor({ name: author })
		.setTitle(title)
		.setURL(url)
		.setThumbnail(thumbnail)
		.setDescription(queue.node.createProgressBar())
		.setFooter({
			iconURL: requestedBy?.avatarURL() ?? requestedBy?.defaultAvatarURL,
			text: `Requested by ${requestedBy?.username}`,
		})
		.setColor('Random');

	if (previousTrack) {
		embed.addFields([{ name: '**Previous track**', value: `**[${previousTrack.title}](${previousTrack.url})**` }]);
	}

	await interaction.reply({ embeds: [embed] });
};

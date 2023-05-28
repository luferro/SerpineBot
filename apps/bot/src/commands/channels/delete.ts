import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel, VoiceChannel } from 'discord.js';

import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete a guild channel.')
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Channel to be deleted.')
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel | VoiceChannel;

	await channel.delete();

	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

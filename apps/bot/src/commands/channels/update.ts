import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel, VoiceChannel } from 'discord.js';

import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('update')
	.setDescription('Update a guild channel.')
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Channel to be updated.')
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
			.setRequired(true),
	)
	.addStringOption((option) => option.setName('name').setDescription('Channel name.'))
	.addStringOption((option) => option.setName('topic').setDescription('Text channel topic.'))
	.addBooleanOption((option) => option.setName('nsfw').setDescription('NSFW channel toggle.'));

export const execute: CommandExecute = async ({ interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel | VoiceChannel;
	const name = interaction.options.getString('name', true);
	const topic = interaction.options.getString('topic');
	const nsfw = interaction.options.getBoolean('nsfw');

	const oldTopic = channel.type === ChannelType.GuildText ? channel.topic : null;
	const oldNsfw = channel.type === ChannelType.GuildText ? channel.nsfw : false;
	await channel.edit({ name: name ?? channel.name, topic: topic ?? oldTopic, nsfw: nsfw ?? oldNsfw });

	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

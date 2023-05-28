import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Create a guild text / voice channel.')
	.addStringOption((option) => option.setName('name').setDescription('Channel name.').setRequired(true))
	.addIntegerOption((option) =>
		option
			.setName('type')
			.setDescription('Whether it should be a text or voice channel.')
			.setRequired(true)
			.addChoices(
				{ name: 'Text Channel', value: ChannelType.GuildText },
				{ name: 'Voice Channel', value: ChannelType.GuildVoice },
			),
	)
	.addStringOption((option) => option.setName('topic').setDescription('Text channel topic.'))
	.addBooleanOption((option) => option.setName('nsfw').setDescription('NSFW channel toggle.'));

export const execute: CommandExecute = async ({ interaction }) => {
	const name = interaction.options.getString('name', true);
	const type = interaction.options.getInteger('type', true) as ChannelType.GuildText | ChannelType.GuildVoice;
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	await interaction.guild.channels.create({ name, type, nsfw, topic });

	const embed = new EmbedBuilder().setTitle(`Channel ${name} has been created.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

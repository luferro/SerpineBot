import { SettingsModel } from '@luferro/database';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('unassign')
	.setDescription('Unassign a bot message from a text channel.')
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Text channel to be unassigned from the message category.')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	await SettingsModel.updateRoleMessage({ guildId: interaction.guild.id, channelId: null, options: [] });

	const embed = new EmbedBuilder().setTitle(`Message unassigned from ${channel.name}.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

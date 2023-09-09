import { SettingsModel } from '@luferro/database';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.channels.roles.unassign.name'))
	.setDescription(t('interactions.channels.roles.unassign.description'))
	.addChannelOption((option) =>
		option
			.setName(t('interactions.channels.roles.unassign.options.0.name'))
			.setDescription(t('interactions.channels.roles.unassign.options.0.description'))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	await SettingsModel.updateRoleMessage({ guildId: interaction.guild.id, channelId: null, options: [] });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.channels.roles.unassign.options.embed.title', { channel: `\`${channel.name}\`` }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

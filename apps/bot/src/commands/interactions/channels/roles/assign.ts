import { SettingsModel } from '@luferro/database';
import { randomUUID } from 'crypto';
import {
	ActionRowBuilder,
	ChannelType,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
	TextChannel,
} from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.channels.roles.assign.name'))
	.setDescription(t('interactions.channels.roles.assign.description'))
	.addChannelOption((option) =>
		option
			.setName(t('interactions.channels.roles.assign.options.0.name'))
			.setDescription(t('interactions.channels.roles.assign.options.0.description'))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	const uuid = randomUUID();
	const options = [...interaction.guild.roles.cache.values()]
		.sort((a, b) => a.position - b.position)
		.filter(({ id }) => id !== interaction.guild.roles.everyone.id)
		.map((role) => ({ label: role.name, value: role.id }));

	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder(t('interactions.channels.roles.assign.options.menu.placeholder'))
		.setMaxValues(options.length)
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.channels.roles.assign.options.menu.title'))
		.setColor('Random');
	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });

	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error(t('errors.interaction.timeout'));

	await SettingsModel.updateRoleMessage({
		guildId: interaction.guild.id,
		channelId: channel.id,
		options: selectMenuInteraction.values,
	});

	const updatedEmbed = new EmbedBuilder()
		.setTitle(t('interactions.channels.roles.assign.options.embed.title', { channel: `\`${channel.name}\`` }))
		.setColor('Random');
	await selectMenuInteraction.update({ embeds: [updatedEmbed], components: [] });

	client.emit('rolesMessageUpdate', client);
};

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

import * as RolesJob from '../../../jobs/roles';
import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('assign')
	.setDescription('Assign the claim-your-roles message to a text channel.')
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Text channel.')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	const options = [...interaction.guild.roles.cache.values()]
		.sort((a, b) => a.position - b.position)
		.filter(({ id }) => id !== interaction.guild.roles.everyone.id)
		.map((role) => ({ label: role.name, value: role.id }));
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();
	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	const embed = new EmbedBuilder().setTitle('Which roles should be included in the message?').setColor('Random');
	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });

	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Channel selection timeout.');

	await SettingsModel.updateRoleMessage({
		guildId: interaction.guild.id,
		channelId: channel.id,
		options: selectMenuInteraction.values,
	});

	const updatedEmbed = new EmbedBuilder()
		.setTitle(`Roles message has been assigned to \`${channel.name}\` channel.`)
		.setColor('Random');
	await selectMenuInteraction.update({ embeds: [updatedEmbed], components: [] });

	await RolesJob.execute({ client });
};

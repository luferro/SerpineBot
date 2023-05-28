import { Action, Integration } from '@luferro/database';
import { EnumUtil } from '@luferro/shared-utils';
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

import * as RolesJob from '../../jobs/roles';
import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('assign')
	.setDescription('Assign a bot message to a text channel.')
	.addIntegerOption((option) =>
		option
			.setName('category')
			.setDescription('Message category.')
			.setRequired(true)
			.addChoices(
				{ name: 'Roles', value: Action.Roles },
				{ name: 'Birthdays', value: Action.Birthdays },
				{ name: 'Leaderboards', value: Action.Leaderboards },
			),
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Text channel to be assigned the message category.')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel;
	const category = interaction.options.getInteger('category', true) as Action;

	const manager = client.settings.message().withGuild(interaction.guild);
	if (category === Action.Birthdays) {
		await manager.create({ category, channel, options: [] });

		const embed = new EmbedBuilder().setTitle(`Message has been assigned to ${channel.name}.`).setColor('Random');
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options =
		category === Action.Roles
			? [...interaction.guild.roles.cache.values()]
					.sort((a, b) => a.position - b.position)
					.filter(({ id }) => id !== interaction.guild.roles.everyone.id)
					.map((role) => ({ label: role.name, value: role.id }))
			: EnumUtil.enumKeysToArray(Integration).map((option) => ({ label: option, value: option }));
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();
	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	const embed = new EmbedBuilder().setTitle('What should be included in the message?').setColor('Random');
	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });

	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Channel selection timeout.');

	await manager.create({ category, channel, options: selectMenuInteraction.values });

	const updatedEmbed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');
	await selectMenuInteraction.update({ embeds: [updatedEmbed], components: [] });

	if (category === Action.Roles) await RolesJob.execute({ client });
};

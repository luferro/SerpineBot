import { IntegrationCategory } from '@luferro/database';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import * as Integrations from '../services/integrations';
import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';

export const data: CommandData = {
	name: CommandName.Integrations,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Integrations)
		.setDescription('Integrations related commands.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('import')
				.setDescription('Adds an integration.')
				.addNumberOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Steam', value: IntegrationCategory.Steam },
							{ name: 'Xbox', value: IntegrationCategory.Xbox },
						),
				)
				.addStringOption((option) =>
					option.setName('account').setDescription('Steam profile url or Xbox gamertag.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('sync').setDescription('Manually synchronizes a Steam integration.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Deletes an integration.')
				.addNumberOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Steam', value: IntegrationCategory.Steam },
							{ name: 'Xbox', value: IntegrationCategory.Xbox },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('notifications')
				.setDescription('Toggles notifications on or off for Steam integrations.')
				.addBooleanOption((option) =>
					option.setName('toggle').setDescription('Notifications toggle.').setRequired(true),
				),
		),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		sync: syncIntegration,
		import: addIntegration,
		delete: deleteIntegration,
		notifications: toggleNotifications,
	};

	await select[subcommand](interaction);
};

const addIntegration = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getNumber('category', true) as IntegrationCategory;
	const account = interaction.options.getString('account', true);

	await Integrations.createIntegration(category, interaction.user.id, account);
	const embed = new EmbedBuilder().setTitle(`${category} account imported successfully.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const syncIntegration = async (interaction: ExtendedChatInputCommandInteraction) => {
	await Integrations.syncIntegration(IntegrationCategory.Steam, interaction.user.id);
	const embed = new EmbedBuilder().setTitle('Steam integration synced successfully.').setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const toggleNotifications = async (interaction: ExtendedChatInputCommandInteraction) => {
	const toggle = interaction.options.getBoolean('toggle', true);

	await Integrations.toggleNotifications(IntegrationCategory.Steam, interaction.user.id, toggle);

	const embed = new EmbedBuilder()
		.setTitle(`Steam integration notifications have been turned ${toggle ? 'on' : 'off'}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteIntegration = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getNumber('category', true) as IntegrationCategory;

	await Integrations.deleteIntegration(category, interaction.user.id);
	const embed = new EmbedBuilder().setTitle(`${category} integration deleted successfully.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

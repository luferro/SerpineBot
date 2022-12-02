import type { CommandData } from '../types/bot';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import type { IntegrationCategory } from '../types/category';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Integrations from '../services/integrations';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Integrations,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Integrations)
		.setDescription('Integrations related commands.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('import')
				.setDescription('Adds an integration.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices({ name: 'Steam', value: 'Steam' }, { name: 'Xbox', value: 'Xbox' }),
				)
				.addStringOption((option) =>
					option.setName('account').setDescription('Steam profile url or Xbox gamertag.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('sync')
				.setDescription('Synchronizes an integration manually.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices({ name: 'Steam', value: 'Steam' }),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Deletes an integration.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices({ name: 'Steam', value: 'Steam' }, { name: 'Xbox', value: 'Xbox' }),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('notifications')
				.setDescription('Turns an integration notifications on or off.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices({ name: 'Steam', value: 'Steam' }),
				)
				.addBooleanOption((option) =>
					option.setName('option').setDescription('Option as a boolean.').setRequired(true),
				),
		),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		sync: syncIntegration,
		import: addIntegration,
		delete: deleteIntegration,
		notifications: integrationNotifications,
	};

	await select[subcommand](interaction);
};

const addIntegration = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as IntegrationCategory;
	const account = interaction.options.getString('account', true);

	await Integrations.create(category, interaction.user.id, account);
	const embed = new EmbedBuilder().setTitle(`${category} account imported successfully.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const syncIntegration = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as Exclude<IntegrationCategory, 'Xbox'>;

	await Integrations.sync(category, interaction.user.id);
	const embed = new EmbedBuilder().setTitle(`${category} integration synced successfully.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const integrationNotifications = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as Exclude<IntegrationCategory, 'Xbox'>;
	const option = interaction.options.getBoolean('option', true);

	await Integrations.notifications(category, interaction.user.id, option);

	const embed = new EmbedBuilder()
		.setTitle(`${category} integration notifications have been turned ${option ? 'on' : 'off'}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteIntegration = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as IntegrationCategory;

	await Integrations.remove(category, interaction.user.id);
	const embed = new EmbedBuilder().setTitle(`${category} integration deleted successfully.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

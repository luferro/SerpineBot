import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Integrations from '../services/integrations';
import { CommandName, IntegrationCategory } from '../types/enums';

export const data = {
	name: CommandName.Integrations,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Integrations)
		.setDescription('Integrations related commands.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('import')
				.setDescription('Adds an integration.')
				.addIntegerOption((option) =>
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
			subcommand
				.setName('sync')
				.setDescription('Synchronizes an integration manually.')
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices({ name: 'Steam', value: IntegrationCategory.Steam }),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Deletes an integration.')
				.addIntegerOption((option) =>
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
				.setDescription('Turns an integration notifications on or off.')
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Integration category.')
						.setRequired(true)
						.addChoices({ name: 'Steam', value: IntegrationCategory.Steam }),
				)
				.addBooleanOption((option) =>
					option.setName('option').setDescription('Option as a boolean.').setRequired(true),
				),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (interaction: ChatInputCommandInteraction) => Promise<void>> = {
		sync: syncIntegration,
		import: addIntegration,
		delete: deleteIntegration,
		notifications: integrationNotifications,
	};

	await select[subcommand](interaction);
};

const addIntegration = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as IntegrationCategory;
	const account = interaction.options.getString('account', true);

	await Integrations.create(category, interaction.user.id, account);

	const embed = new EmbedBuilder()
		.setTitle(`${IntegrationCategory[category]} account imported successfully.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const syncIntegration = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as Exclude<
		IntegrationCategory,
		IntegrationCategory.Xbox
	>;

	await Integrations.sync(category, interaction.user.id);

	const embed = new EmbedBuilder()
		.setTitle(`${IntegrationCategory[category]} integration synced successfully.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const integrationNotifications = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as Exclude<
		IntegrationCategory,
		IntegrationCategory.Xbox
	>;
	const option = interaction.options.getBoolean('option', true);

	await Integrations.notifications(category, interaction.user.id, option);

	const embed = new EmbedBuilder()
		.setTitle(
			`${IntegrationCategory[category]} integration notifications have been turned ${option ? 'on' : 'off'}.`,
		)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteIntegration = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as IntegrationCategory;

	await Integrations.remove(category, interaction.user.id);

	const embed = new EmbedBuilder()
		.setTitle(`${IntegrationCategory[category]} integration deleted successfully.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

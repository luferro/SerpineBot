import type { Bot } from '../structures/bot';
import type { WebhookCategory } from '../types/category';
import type { ChatInputCommandInteraction, Guild, GuildBasedChannel } from 'discord.js';
import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import * as Webhooks from '../services/webhooks';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Webhooks,
	isClientRequired: true,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Webhooks)
		.setDescription('Webhooks related commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a webhook and assign it to a text channel.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Webhook category.')
						.setRequired(true)
						.addChoices(
							{ name: 'NSFW', value: 'Nsfw' },
							{ name: 'Memes', value: 'Memes' },
							{ name: 'Anime', value: 'Anime' },
							{ name: 'Manga', value: 'Manga' },
							{ name: 'World News', value: 'World News' },
							{ name: 'Gaming News', value: 'Gaming News' },
							{ name: 'Game Reviews', value: 'Reviews' },
							{ name: 'Game Deals', value: 'Deals' },
							{ name: 'Free Games', value: 'Free Games' },
							{ name: 'Xbox', value: 'Xbox' },
							{ name: 'PlayStation', value: 'PlayStation' },
							{ name: 'Nintendo', value: 'Nintendo' },
						),
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Text channel to receive webhook content.')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a webhook.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Webhook category.')
						.setRequired(true)
						.addChoices(
							{ name: 'NSFW', value: 'Nsfw' },
							{ name: 'Memes', value: 'Memes' },
							{ name: 'Anime', value: 'Anime' },
							{ name: 'Manga', value: 'Manga' },
							{ name: 'World News', value: 'World News' },
							{ name: 'Gaming News', value: 'Gaming News' },
							{ name: 'Game Reviews', value: 'Reviews' },
							{ name: 'Game Deals', value: 'Deals' },
							{ name: 'Free Games', value: 'Free Games' },
							{ name: 'Xbox', value: 'Xbox' },
							{ name: 'PlayStation', value: 'PlayStation' },
							{ name: 'Nintendo', value: 'Nintendo' },
						),
				),
		),
};

export const execute = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select = (category: string) => {
		const options: Record<string, (arg0: Bot, arg1: ChatInputCommandInteraction) => Promise<void>> = {
			create: createWebhook,
			delete: deleteWebhook,
		};
		return options[category](client, interaction);
	};
	await select(subcommand);
};

const createWebhook = async (_client: Bot, interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as WebhookCategory;
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	if (channel.type !== ChannelType.GuildText) throw new Error('Webhooks can only be assigned to text channels.');

	const guild = interaction.guild as Guild;
	await Webhooks.create(guild.id, channel, category);

	const embed = new EmbedBuilder()
		.setTitle(`${Webhooks.getWebhookNameFromCategory(category)} webhook has been assigned to ${channel.name}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const deleteWebhook = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as WebhookCategory;
	const guild = interaction.guild as Guild;

	await Webhooks.remove(client, guild.id, category);

	const embed = new EmbedBuilder()
		.setTitle(`${Webhooks.getWebhookNameFromCategory(category)} webhook has been deleted.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

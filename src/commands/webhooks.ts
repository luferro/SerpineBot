import {
	ChannelType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Guild,
	GuildBasedChannel,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { Bot } from '../bot';
import * as Webhooks from '../services/webhooks';
import { CommandName, WebhookCategory } from '../types/enums';

export const data = {
	name: CommandName.Webhooks,
	client: true,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Webhooks)
		.setDescription('Webhooks related commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a webhook and assign it to a text channel.')
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Webhook category.')
						.setRequired(true)
						.addChoices(
							{ name: 'NSFW', value: WebhookCategory.Nsfw },
							{ name: 'Memes', value: WebhookCategory.Memes },
							{ name: 'Anime', value: WebhookCategory.Anime },
							{ name: 'Manga', value: WebhookCategory.Manga },
							{ name: 'World News', value: WebhookCategory.WorldNews },
							{ name: 'Gaming News', value: WebhookCategory.GamingNews },
							{ name: 'Game Reviews', value: WebhookCategory.Reviews },
							{ name: 'Game Deals', value: WebhookCategory.Deals },
							{ name: 'Free Games', value: WebhookCategory.FreeGames },
							{ name: 'Xbox', value: WebhookCategory.Xbox },
							{ name: 'PlayStation', value: WebhookCategory.PlayStation },
							{ name: 'Nintendo', value: WebhookCategory.Nintendo },
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
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Webhook category.')
						.setRequired(true)
						.addChoices(
							{ name: 'NSFW', value: WebhookCategory.Nsfw },
							{ name: 'Memes', value: WebhookCategory.Memes },
							{ name: 'Anime', value: WebhookCategory.Anime },
							{ name: 'Manga', value: WebhookCategory.Manga },
							{ name: 'World News', value: WebhookCategory.WorldNews },
							{ name: 'Gaming News', value: WebhookCategory.GamingNews },
							{ name: 'Game Reviews', value: WebhookCategory.Reviews },
							{ name: 'Game Deals', value: WebhookCategory.Deals },
							{ name: 'Free Games', value: WebhookCategory.FreeGames },
							{ name: 'Xbox', value: WebhookCategory.Xbox },
							{ name: 'PlayStation', value: WebhookCategory.PlayStation },
							{ name: 'Nintendo', value: WebhookCategory.Nintendo },
						),
				),
		),
};

export const execute = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select = (category: string) => {
		const options: Record<string, (client: Bot, interaction: ChatInputCommandInteraction) => Promise<void>> = {
			create: createWebhook,
			delete: deleteWebhook,
		};
		return options[category](client, interaction);
	};
	await select(subcommand);
};

const createWebhook = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as WebhookCategory;
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	if (channel.type !== ChannelType.GuildText) throw new Error('Webhooks can only be assigned to text channels.');

	const guild = interaction.guild as Guild;
	await Webhooks.create(guild.id, channel, category);

	const embed = new EmbedBuilder()
		.setTitle(`${WebhookCategory[category]} webhook has been assigned to ${channel.name}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const deleteWebhook = async (client: Bot, interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as WebhookCategory;
	const guild = interaction.guild as Guild;

	await Webhooks.remove(client, guild.id, category);

	const embed = new EmbedBuilder()
		.setTitle(`${WebhookCategory[category]} webhook has been deleted.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

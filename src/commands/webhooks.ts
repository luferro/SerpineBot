import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildBasedChannel, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../bot';
import * as Webhooks from '../services/webhooks';
import { WebhookCategories } from '../types/categories';

export const data = {
	name: 'webhooks',
	client: true,
	slashCommand: new SlashCommandBuilder()
		.setName('webhooks')
		.setDescription('Webhooks related commands.')
		.setDefaultPermission(false)
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
							{ name: 'NSFW', value: 'NSFW' },
							{ name: 'Memes', value: 'Memes' },
							{ name: 'Anime', value: 'Anime' },
							{ name: 'Manga', value: 'Manga' },
							{ name: 'World News', value: 'World News' },
							{ name: 'Gaming News', value: 'Gaming News' },
							{ name: 'Reviews', value: 'Reviews' },
							{ name: 'Deals', value: 'Deals' },
							{ name: 'Free Games', value: 'Free Games' },
							{ name: 'Xbox', value: 'Xbox' },
							{ name: 'Playstation', value: 'Playstation' },
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
							{ name: 'NSFW', value: 'NSFW' },
							{ name: 'Memes', value: 'Memes' },
							{ name: 'Anime', value: 'Anime' },
							{ name: 'Manga', value: 'Manga' },
							{ name: 'World News', value: 'World News' },
							{ name: 'Gaming News', value: 'Gaming News' },
							{ name: 'Reviews', value: 'Reviews' },
							{ name: 'Deals', value: 'Deals' },
							{ name: 'Free Games', value: 'Free Games' },
							{ name: 'Xbox', value: 'Xbox' },
							{ name: 'Playstation', value: 'Playstation' },
							{ name: 'Nintendo', value: 'Nintendo' },
						),
				),
		),
};

export const execute = async (client: Bot, interaction: CommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select = (category: string) => {
		const options: Record<string, (client: Bot, interaction: CommandInteraction) => Promise<void>> = {
			create: createWebhook,
			delete: deleteWebhook,
		};
		return options[category](client, interaction);
	};
	await select(subcommand);
};

const createWebhook = async (client: Bot, interaction: CommandInteraction) => {
	const category = interaction.options.getString('category')! as WebhookCategories;
	const channel = interaction.options.getChannel('channel')! as GuildBasedChannel;

	if (channel.type !== 'GUILD_TEXT')
		return await interaction.reply({ content: 'Webhooks can only be assigned to text channels.', ephemeral: true });

	const guild = interaction.guild as Guild;
	const textChannel = channel as TextChannel;

	const result = await Webhooks.create(guild.id, textChannel, category).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [
			new MessageEmbed().setTitle(`${category} webhook has been assigned to ${channel.name}.`).setColor('RANDOM'),
		],
	});
};

const deleteWebhook = async (client: Bot, interaction: CommandInteraction) => {
	const category = interaction.options.getString('category')! as WebhookCategories;
	const guild = interaction.guild as Guild;

	const result = await Webhooks.remove(client, guild.id, category).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`${category} webhook has been deleted.`).setColor('RANDOM')],
	});
};

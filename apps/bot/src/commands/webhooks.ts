import { WebhookCategory } from '@luferro/database';
import type { GuildBasedChannel } from 'discord.js';
import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import * as Webhooks from '../services/webhooks';
import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';

export const data: CommandData = {
	name: CommandName.Webhooks,
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
							{ name: 'Portugal News', value: WebhookCategory.PortugalNews },
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
							{ name: 'Portugal News', value: WebhookCategory.PortugalNews },
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

export const execute: CommandExecute = async ({ interaction }) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		create: createWebhook,
		delete: deleteWebhook,
	};

	await select[subcommand](interaction);
};

const createWebhook = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as WebhookCategory;
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	if (channel.type !== ChannelType.GuildText) throw new Error('Webhooks can only be assigned to text channels.');

	await Webhooks.createWebhook(interaction.guild.id, channel, category);

	const embed = new EmbedBuilder()
		.setTitle(`${Webhooks.getWebhookName(category)} webhook has been assigned to ${channel.name}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const deleteWebhook = async (interaction: ExtendedChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as WebhookCategory;

	await Webhooks.deleteWebhook(interaction.client, interaction.guild.id, category);

	const embed = new EmbedBuilder()
		.setTitle(`${Webhooks.getWebhookName(category)} webhook has been deleted.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

import { SettingsModel, WebhookType } from '@luferro/database';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';

import type { InteractionCommandExecute, InteractionCommandData } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Create a webhook and assign it to a text channel.')
	.addStringOption((option) =>
		option
			.setName('category')
			.setDescription('Webhook category.')
			.setRequired(true)
			.addChoices(
				{ name: 'Birthdays', value: 'Birthdays' },
				{ name: 'Leaderboards', value: 'Leaderboards' },
				{ name: 'Events', value: 'Events' },
				{ name: 'NSFW', value: 'Nsfw' },
				{ name: 'Memes', value: 'Memes' },
				{ name: 'Anime', value: 'Anime' },
				{ name: 'Manga', value: 'Manga' },
				{ name: 'World News', value: 'World News' },
				{ name: 'Portugal News', value: 'Portugal News' },
				{ name: 'Gaming News', value: 'Gaming News' },
				{ name: 'Game Reviews', value: 'Game Reviews' },
				{ name: 'Game Deals', value: 'Game Deals' },
				{ name: 'Free Games', value: 'Free Games' },
				{ name: 'Xbox', value: 'Xbox' },
				{ name: 'PlayStation', value: 'PlayStation' },
				{ name: 'Nintendo', value: 'Nintendo' },
			),
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Text channel.')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const category = interaction.options.getString('category', true) as WebhookType;
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	if (category === 'Nsfw' && !channel.nsfw) throw new Error('Not a NSFW channel.');

	const settings = await SettingsModel.getSettingsByGuildId({ guildId: interaction.guild.id });
	const webhook = settings?.webhooks.get(category);
	if (webhook) throw new Error('Webhook is already assigned to a text channel in this guild.');

	const { id, token } = await channel.createWebhook({ name: category });
	if (!token) throw new Error('Token was not provided.');

	await SettingsModel.addWebhook({ guildId: interaction.guild.id, webhook: { id, token, category } });

	const embed = new EmbedBuilder().setTitle(`Webhook has been assigned to ${channel.name}.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

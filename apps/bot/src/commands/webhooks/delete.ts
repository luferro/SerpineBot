import { SettingsModel, WebhookType } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete a webhook.')
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
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const category = interaction.options.getString('category', true) as WebhookType;

	const settings = await SettingsModel.getSettingsByGuildId({ guildId: interaction.guild.id });
	const webhook = settings?.webhooks.get(category);
	if (!webhook) throw new Error('Webhook is not assigned to a text channel in this guild.');

	const guildWebhook = await client.webhook({ guild: interaction.guild, category });
	if (!guildWebhook) return;

	await guildWebhook.delete();
	await SettingsModel.removeWebhook({ guildId: interaction.guild.id, category });

	const embed = new EmbedBuilder().setTitle('Webhook has been deleted.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

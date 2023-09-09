import { SettingsModel, webhooks, WebhookType } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.webhooks.delete.name'))
	.setDescription(t('interactions.webhooks.delete.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.webhooks.delete.options.0.name'))
			.setDescription(t('interactions.webhooks.delete.options.0.description'))
			.setRequired(true)
			.addChoices(...webhooks.map((webhook) => ({ name: webhook, value: webhook }))),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const category = interaction.options.getString(
		t('interactions.webhooks.delete.options.0.name'),
		true,
	) as WebhookType;

	const settings = await SettingsModel.getSettingsByGuildId({ guildId: interaction.guild.id });
	const webhook = settings?.webhooks.get(category);
	if (!webhook) throw new Error(t('errors.unprocessable'));

	const guildWebhook = await client.webhook({ guild: interaction.guild, category });
	if (!guildWebhook) return;

	await guildWebhook.delete();
	await SettingsModel.removeWebhook({ guildId: interaction.guild.id, category });

	const embed = new EmbedBuilder().setTitle(t('interactions.webhooks.delete.embed.title')).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

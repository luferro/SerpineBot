import { SettingsModel, webhooks, WebhookType } from '@luferro/database';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.webhooks.create.name'))
	.setDescription(t('interactions.webhooks.create.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.webhooks.create.options.0.name'))
			.setDescription(t('interactions.webhooks.create.options.0.description'))
			.setRequired(true)
			.addChoices(...webhooks.map((webhook) => ({ name: webhook, value: webhook }))),
	)
	.addChannelOption((option) =>
		option
			.setName(t('interactions.webhooks.create.options.1.name'))
			.setDescription(t('interactions.webhooks.create.options.1.description'))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const category = interaction.options.getString('category', true) as WebhookType;
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	if (category === 'Nsfw' && !channel.nsfw) throw new Error(t('errors.channel.nsfw'));

	const settings = await SettingsModel.getSettingsByGuildId({ guildId: interaction.guild.id });
	const webhook = settings?.webhooks.get(category);
	if (webhook) throw new Error(t('errors.unprocessable'));

	const { id, token } = await channel.createWebhook({ name: category });
	if (!token) throw new Error(t('errors.webhook.token'));

	await SettingsModel.addWebhook({ guildId: interaction.guild.id, webhook: { id, token, category } });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.webhooks.create.embed.title', { channel: `\`${channel.name}\`` }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

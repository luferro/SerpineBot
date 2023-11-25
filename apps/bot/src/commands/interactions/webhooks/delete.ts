import { WebhookType } from '@luferro/database';
import { ObjectUtil } from '@luferro/shared-utils';
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
			.addChoices(...ObjectUtil.enumToArray(WebhookType).map((webhook) => ({ name: webhook, value: webhook }))),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const type = interaction.options.getString(data.options[0].name, true) as WebhookType;

	const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
	const webhook = settings?.webhooks.find((webhook) => webhook.type === type);
	if (!webhook) throw new Error(t('errors.unprocessable'));

	const guildWebhook = await client.webhook({ guild: interaction.guild, type });
	if (!guildWebhook) throw new Error(t('errors.unprocessable'));

	await guildWebhook.delete();
	await client.prisma.guild.update({
		where: { id: interaction.guild.id },
		data: { webhooks: { deleteMany: { where: { type } } } },
	});

	const embed = new EmbedBuilder().setTitle(t('interactions.webhooks.delete.embed.title')).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

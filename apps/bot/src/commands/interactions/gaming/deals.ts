import { SubscriptionsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.deals.name'))
	.setDescription(t('interactions.gaming.deals.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.gaming.deals.options.0.name'))
			.setDescription(t('interactions.gaming.deals.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.gaming.deals.options.0.name'), true);

	const { id, title } = await client.api.gaming.deals.search({ query });
	if (!id) throw new Error(t('errors.search.lookup', { query }));

	const subscriptions = await SubscriptionsModel.getGamingServices({ name: query });
	const formattedSubscriptions = subscriptions.map(({ provider }) => `> **${provider}**`);

	const { historicalLow, bundles, prices } = await client.api.gaming.deals.getDealById({ id });
	const formattedBundles = bundles.active.map(({ title, url, store }) => `> **${title}** @ [${store}](${url})`);
	const formattedPrices = prices.map(({ store, discounted, url }) => `**${discounted}** @ [${store}](${url})`);
	const formattedHistoricalLow = historicalLow
		? `**${historicalLow.price}** @ ${historicalLow.store}\n*${historicalLow.date}*`
		: null;

	const embed = new EmbedBuilder()
		.setTitle(title)
		.addFields([
			{
				name: t('interactions.gaming.deals.embed.fields.0.name'),
				value: formattedHistoricalLow ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.gaming.deals.embed.fields.1.name'),
				value: formattedPrices.join('\n') || t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.gaming.deals.embed.fields.2.name'),
				value: formattedBundles.join('\n') || t('common.unavailable'),
			},
			{
				name: t('interactions.gaming.deals.embed.fields.3.name'),
				value: formattedSubscriptions.join('\n') || t('common.unavailable'),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

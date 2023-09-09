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

	const { id, title } = await client.api.gaming.deals.search(query);
	if (!id) throw new Error(t('errors.search.lookup', { query }));

	const subscriptions = await SubscriptionsModel.getMatches({ name: query });
	const formattedSubscriptions = subscriptions.map(({ provider }) => `> **${provider}**`);

	const { url, deal, historicalLow, bundles } = await client.api.gaming.deals.getDealById(id);

	const formattedBundles = bundles.live.map(({ title, url, store }) => `> **${title}** @ [${store}](${url})`);

	const embed = new EmbedBuilder()
		.setTitle(title)
		.setURL(url)
		.addFields([
			{
				name: `**${t('gaming.deals.embed.fields.0.name')}**`,
				value: `**${historicalLow.price}** @ ${
					historicalLow.url ? `[${historicalLow.store}](${historicalLow.url})` : historicalLow.store
				}\n*${historicalLow.on}*`,
				inline: true,
			},
			{
				name: `**${t('gaming.deals.embed.fields.1.name')}**`,
				value: `**${deal.price}** @ [${deal.store}](${deal.url})`,
				inline: true,
			},
			{
				name: `**${t('gaming.deals.embed.fields.2.name')}**`,
				value: formattedBundles.join('\n') || t('common.unavailable'),
			},
			{
				name: `**${t('gaming.deals.embed.fields.3.name')}**`,
				value: formattedSubscriptions.join('\n') || t('common.unavailable'),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

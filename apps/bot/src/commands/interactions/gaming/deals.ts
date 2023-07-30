import { SubscriptionsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandExecute, InteractionCommandData } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('deals')
	.setDescription('Best PC deals in official stores and keyshops.')
	.addStringOption((option) => option.setName('query').setDescription('Game title').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const { id, title } = await client.api.gaming.deals.search(query);
	if (!id) throw new Error(`No matches for "${query}".`);

	const subscriptions = await SubscriptionsModel.getMatches({ name: query });
	const formattedSubscriptions = subscriptions.map(({ provider }) => `> **${provider}**`);

	const { url, deal, historicalLow, bundles } = await client.api.gaming.deals.getDealById(id);

	const formattedBundles = bundles.live.map(({ title, url, store }) => `> **${title}** @ [${store}](${url})`);

	const embed = new EmbedBuilder()
		.setTitle(title)
		.setURL(url)
		.addFields([
			{
				name: '**Historical Low**',
				value: `**${historicalLow.price}** @ ${
					historicalLow.url ? `[${historicalLow.store}](${historicalLow.url})` : historicalLow.store
				}\n*${historicalLow.on}*`,
				inline: true,
			},
			{
				name: '**Best deal**',
				value: `**${deal.price}** @ [${deal.store}](${deal.url})`,
				inline: true,
			},
			{
				name: '**Live bundles**',
				value: formattedBundles.join('\n') || 'N/A',
			},
			{
				name: '**Subscriptions**',
				value: formattedSubscriptions.join('\n') || 'N/A',
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

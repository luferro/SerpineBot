import { SubscriptionsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('deals')
	.setDescription('Best PC deals in official stores and keyshops.')
	.addStringOption((option) => option.setName('query').setDescription('Game title').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const { id } = await client.api.gaming.deals.search(query);
	if (!id) throw new Error(`No matches for "${query}".`);

	const subscriptions = await SubscriptionsModel.getMatches({ name: query });
	const formattedSubscriptions = subscriptions.map(({ provider }) => `**${provider}**`);

	const deal = await client.api.gaming.deals.getDealById(id);
	const { name, image, historicalLows, officialStores, keyshops, coupons } = deal;

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(`https://gg.deals/eu/game/${id}`)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Historical Low Prices**',
				value: historicalLows.join('\n') || 'N/A',
			},
			{
				name: '**Official Stores**',
				value: officialStores.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Keyshops**',
				value: keyshops.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Coupons**',
				value: coupons.join('\n') || 'N/A',
			},
			{
				name: '**Subscriptions**',
				value: formattedSubscriptions.join('\n') || 'N/A',
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

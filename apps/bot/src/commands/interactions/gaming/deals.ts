import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";

import type { InteractionCommandData, InteractionCommandExecute } from "../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.deals.name"))
	.setDescription(t("interactions.gaming.deals.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.gaming.deals.options.0.name"))
			.setDescription(t("interactions.gaming.deals.options.0.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const query = interaction.options.getString(data.options[0].name, true);

	const results = await client.api.gaming.games.deals.search({ query });
	if (results.length === 0) throw new Error(t("errors.search.lookup", { query }));
	const { id, title } = results[0];

	const subscriptions = await client.prisma.subscription.search({ query });
	const formattedSubscriptions = subscriptions.map((subscription) => `> **${subscription.name}**`);

	const { historicalLow, bundles, prices } = await client.api.gaming.games.deals.getDealById({ id });
	const formattedBundles = bundles.active.map(({ title, url, store }) => `> **${title}** @ [${store}](${url})`);
	const formattedPrices = prices
		.slice(0, 5)
		.map(({ store, discounted, url }) => `**[${store}](${url})** - **${discounted}**`);
	const formattedHistoricalLow = historicalLow
		? `**${historicalLow.price}** @ ${historicalLow.store} - *${historicalLow.date}*`
		: null;

	const embed = new EmbedBuilder()
		.setTitle(title)
		.addFields([
			{
				name: t("interactions.gaming.deals.embed.fields.0.name"),
				value: formattedHistoricalLow ?? t("common.unavailable"),
			},
			{
				name: t("interactions.gaming.deals.embed.fields.1.name"),
				value: formattedPrices.join("\n") || t("common.unavailable"),
			},
			{
				name: t("interactions.gaming.deals.embed.fields.2.name"),
				value: formattedBundles.join("\n") || t("common.unavailable"),
			},
			{
				name: t("interactions.gaming.deals.embed.fields.3.name"),
				value: formattedSubscriptions.join("\n") || t("common.unavailable"),
			},
		])
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};

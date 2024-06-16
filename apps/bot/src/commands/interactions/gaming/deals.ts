import { formatCurrency } from "@luferro/helpers/currency";
import { formatDistance } from "@luferro/helpers/datetime";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.gaming.deals.name"))
	.setDescription(t("interactions.gaming.deals.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.gaming.deals.options.0.name"))
			.setDescription(t("interactions.gaming.deals.options.0.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction, localization = {} }) => {
	await interaction.deferReply();
	const query = interaction.options.getString(data.options[0].name, true);

	const results = await client.api.gaming.games.deals.search(query);
	if (results.length === 0) throw new Error(t("errors.search.lookup", { query }));
	const { id, title } = results[0];

	const formatPrice = (price: { amount: number; currency: string }) => {
		return formatCurrency(price.amount, { currency: price.currency, ...localization });
	};

	const subscriptions = await client.db.subscription.search({ query });
	const formattedSubscriptions = subscriptions.map((subscription) => `> **${subscription.name}**`);

	const { historicalLow, bundles, prices } = await client.api.gaming.games.deals.getDealsById(id);
	const formattedBundles = bundles.map(({ title, url, store }) => `> **${title}** @ [${store}](${url})`);
	const formattedPrices = prices
		.slice(0, 5)
		.map(({ store, discounted, url }) => `**[${store}](${url})** - **${formatPrice(discounted)}**`);
	const formattedHistoricalLow = historicalLow?.timestamp
		? `**${formatPrice(historicalLow.discounted)}** @ ${historicalLow.store} - *${formatDistance(
				historicalLow.timestamp,
			)}*`
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

import { formatCurrency } from "@luferro/utils/currency";
import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class DealsCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "deals",
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("deals")
				.setDescription("What is the current best deal for your next game?")
				.addStringOption((command) =>
					command.setName("game").setDescription("Game title").setRequired(true).setAutocomplete(true),
				),
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const id = interaction.options.getString("game", true);

		const deal = await this.container.gql.itad.getDealsById({ input: { id } });
		if (!deal || deal.deals.length === 0) throw new Error("No deals found.");

		const features = [
			deal.isEarlyAccess && "Early Access",
			deal.hasAchievements && "Achievements",
			deal.hasTradingCards && "Trading Cards",
		].filter((feature): feature is string => Boolean(feature));

		const historicalLows = Object.entries(deal.historicalLow)
			.map(([type, low]) => {
				const options: Record<string, string> = {
					all: "All time",
					y1: "1 year",
					m3: "3 months",
				};

				const historicalLowType = options[type];
				if (!historicalLowType || !low || typeof low === "string") return;

				return `**${historicalLowType}** ${formatCurrency(low.amount, { currency: low.currency })}`;
			})
			.filter((historicalLow): historicalLow is string => Boolean(historicalLow));

		const deals = deal.deals.slice(0, 5).map(({ store, storeHistoricalLow, discounted, url }, index) => {
			const list = [
				`\`${index + 1}.\` **[${store}](${url})** - **${formatCurrency(discounted.amount, { currency: discounted.currency })}**`,
			];

			if (storeHistoricalLow) {
				list.push(
					`*Store historical low of ${formatCurrency(storeHistoricalLow.amount, { currency: storeHistoricalLow.currency })}*`,
				);
			}

			return list.join("\n");
		});

		const bundles = deal.bundles.map(
			({ title, url, store, expiry }) =>
				`> **${title}** @ [${store}](${url}) (${expiry && new Date(expiry).getTime() > Date.now() ? "Expired" : "Active"})`,
		);

		const embed = new EmbedBuilder()
			.setTitle(deal.title)
			.setURL(deal.appId ? `https://steamcommunity.com/app/${deal.appId}` : null)
			.setThumbnail(deal.image ?? null)
			.addFields([
				{
					name: "**Historical lows**",
					value: historicalLows.join("\n") || "n/a",
				},
				{
					name: "**Official stores**",
					value: deals.join("\n"),
				},
				{
					name: "**Bundles**",
					value: bundles.join("\n") || "n/a",
				},
			])
			.setFooter({ text: features.join(" • ") })
			.setColor("Random");

		await interaction.editReply({ embeds: [embed] });
	}
}

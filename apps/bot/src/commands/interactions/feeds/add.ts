import { enumToArray } from "@luferro/helpers/transform";
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, type TextChannel } from "discord.js";
import { t } from "i18next";
import { FeedType } from "~/structures/Database.js";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.feeds.add.name"))
	.setDescription(t("interactions.feeds.add.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.0.name"))
			.setDescription(t("interactions.feeds.add.options.0.description"))
			.setRequired(true)
			.addChoices(...enumToArray(FeedType).map((type) => ({ name: type, value: type }))),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.1.name"))
			.setDescription(t("interactions.feeds.add.options.1.description"))
			.setRequired(true),
	)
	.addChannelOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.2.name"))
			.setDescription(t("interactions.feeds.add.options.2.description"))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.3.name"))
			.setDescription(t("interactions.feeds.add.options.3.description")),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.4.name"))
			.setDescription(t("interactions.feeds.add.options.4.description")),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.5.name"))
			.setDescription(t("interactions.feeds.add.options.5.description")),
	)
	.addIntegerOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.6.name"))
			.setDescription(t("interactions.feeds.add.options.6.description")),
	)
	.addBooleanOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.7.name"))
			.setDescription(t("interactions.feeds.add.options.7.description")),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.feeds.add.options.8.name"))
			.setDescription(t("interactions.feeds.add.options.8.description")),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const type = interaction.options.getString(data.options[0].name, true) as FeedType;
	const name = interaction.options.getString(data.options[1].name, true);
	const channel = interaction.options.getChannel(data.options[2].name, true) as TextChannel;
	const feed = interaction.options.getString(data.options[3].name) ?? "self";
	const sort = interaction.options.getString(data.options[4].name) ?? "hot";
	const flairs = interaction.options.getString(data.options[5].name)?.split(";") ?? [];
	const limit = interaction.options.getInteger(data.options[6].name) ?? 100;
	const external = interaction.options.getBoolean(data.options[7].name) ?? false;
	const selector = interaction.options.getString(data.options[8].name) ?? "img:first-child";

	const getWebhook = async () => {
		const webhooks = await channel.fetchWebhooks();
		const webhook = webhooks.find((webhook) => webhook.name === name);

		if (!webhook) {
			const createdWebhook = await channel.createWebhook({ name });
			return { id: createdWebhook.id, token: createdWebhook.token };
		}

		return { id: webhook.id, token: webhook.token };
	};

	const { id: channelId, guildId } = channel;
	const exists = await client.db.feeds.exists({ where: { type, feeds: { some: { channelId, feed } } } });
	if (exists) throw new Error("errors.unprocessable");

	const { id, token } = await getWebhook();
	if (!id || !token) throw new Error(t("errors.webhook.token"));

	const entry = {
		guildId,
		channelId,
		feed,
		webhook: { id, token },
		cache: { enabled: true, fields: ["url"] },
		options: { sort, flairs, limit, image: { external, selector } },
	};

	await client.db.feeds.upsert({
		where: { type },
		create: { type, feeds: [entry] },
		update: { feeds: { push: entry } },
	});

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.feeds.add.embed.title", { type, feed, channel: channel.name }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};

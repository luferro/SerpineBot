import { WebhookType } from "@luferro/database";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { JobData, JobExecute } from "../../../types/bot";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	await client.propagate({
		type: WebhookType.FREE_GAMES,
		messages: [...(await getFreebies({ client })), ...(await getRssFeeds({ client }))],
	});
};

const getFreebies = async ({ client }: Parameters<typeof execute>[0]) => {
	const freebies = await client.api.gaming.games.deals.getFreebies();

	const messages = [];
	for (const { title, url, discount, regular, store, expiry } of freebies.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(t("jobs.gaming.deals.free.embed.description", { discount, regular, store }))
			.setFooter(expiry ? { text: t("jobs.gaming.deals.free.embed.footer.text", { expiry }) } : null)
			.setColor("Random");

		messages.push(embed);
	}

	return messages;
};

const getRssFeeds = async ({ client }: Parameters<typeof execute>[0]) => {
	const rss = await client.prisma.rss.findUnique({ where: { webhook: WebhookType.FREE_GAMES } });
	const feed = await client.scraper.rss.consume({ feeds: rss?.feeds ?? [] });

	const messages = [];
	for (const { title, url, image, description } of feed.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setImage(image)
			.setDescription(description)
			.setColor("Random");

		messages.push(embed);
	}

	return messages;
};

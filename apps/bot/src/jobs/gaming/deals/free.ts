import { WebhookType } from "@luferro/database";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { JobData, JobExecute } from "../../../types/bot";
import { ConverterUtil, DateUtil } from "@luferro/shared-utils";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const localization = client.getLocalization();

	const messages = [];
	const { feeds } = await client.prisma.config.getWebhookConfig({ webhook: WebhookType.FREE_GAMES });

	const freebies = await client.api.gaming.games.deals.getFreebies();
	for (const { title, url, discount, regular, store, expiry } of freebies.reverse()) {
		const { amount, currency } = regular;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(
				t("jobs.gaming.deals.free.embed.description", {
					store,
					discount,
					regular: ConverterUtil.formatCurrency({ amount, currency, ...localization }),
				}),
			)
			.setFooter(
				expiry
					? {
							text: t("jobs.gaming.deals.free.embed.footer.text", {
								expiry: DateUtil.format({ date: expiry, ...localization }),
							}),
					  }
					: null,
			)
			.setColor("Random");

		messages.push(embed);
	}

	const feed = await client.scraper.rss.consume({ feeds });
	for (const { title, url, image, description } of feed.reverse()) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setImage(image)
			.setDescription(description)
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.FREE_GAMES, messages });
};

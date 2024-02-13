import { WebhookType } from "@luferro/database";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { JobData, JobExecute } from "../../types/bot";
import { DateUtil } from "@luferro/shared-utils";

export const data: JobData = { schedule: "0 */30 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const results = await client.api.gaming.games.reviews.search({});

	const messages = [];
	for (const { id, slug } of results.reverse()) {
		const aggregation = await client.api.gaming.games.reviews.getReviewsByIdAndSlug({ id, slug });
		const { title, url, releaseDate, platforms, tier, score, count, recommended, image } = aggregation;
		if (!tier || !score) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setThumbnail(tier)
			.setImage(image)
			.addFields([
				{
					name: t("jobs.gaming.reviews.embed.fields.0.name"),
					value: releaseDate
						? DateUtil.format({ date: releaseDate, format: "dd/MM/yyyy" })
						: t("jobs.gaming.reviews.embed.fields.0.value"),
				},
				{
					name: t("jobs.gaming.reviews.embed.fields.1.name"),
					value: platforms.join("\n") || t("common.unavailable"),
				},
				{
					name: t("jobs.gaming.reviews.embed.fields.2.name"),
					value: score ?? t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.gaming.reviews.embed.fields.3.name"),
					value: count ?? t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.gaming.reviews.embed.fields.4.name"),
					value: recommended ?? t("common.unavailable"),
					inline: true,
				},
			])
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.GAME_REVIEWS, messages });
};

import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */5 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const schedule = (await client.api.anime.getWeeklySchedule()).filter(
		(anime) => new Date(anime.airing.sub.at ?? anime.airing.raw.at).getDay() === new Date().getDay(),
	);

	const messages = [];
	for (const anime of schedule) {
		const { title, coverImage, format, score, airing, episodes, duration, streams, trackers, isDelayed } = anime;

		const notAiredYet = Date.now() < new Date(airing.sub.at ?? airing.raw.at).getTime();
		if (notAiredYet || isDelayed || !title.romaji) continue;

		const type = airing.sub.at ? "SUB" : "RAW";
		const formattedTracking = trackers?.map(({ name, url }) => `> **[${StringUtil.capitalize(name)}](${url})**`);
		const formattedStreams = streams?.map(({ name, url }) => `> **[${StringUtil.capitalize(name)}](${url})**`);

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title.english ?? title.romaji))
			.setDescription(t("jobs.anime.episode.embed.description", { episode: airing.episode, type }))
			.setThumbnail(coverImage.extraLarge ?? coverImage.large ?? coverImage.medium)
			.addFields([
				{
					name: t("jobs.anime.episode.embed.fields.0.name"),
					value: score ? `${score} / 10` : t("common.unavailable"),
				},
				{
					name: t("jobs.anime.episode.embed.fields.1.name"),
					value: formattedStreams.join("\n") || t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.anime.episode.embed.fields.2.name"),
					value: formattedTracking.join("\n") || t("common.unavailable"),
					inline: true,
				},
			])
			.setFooter({
				text: [
					episodes ? t("common.episodes", { episodes }) : null,
					format,
					duration ? t("common.time.minutes", { minutes: duration }) : null,
				]
					.filter((item) => !!item)
					.join(" • "),
			})
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.ANIME, messages });
};

import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */5 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const schedule = (await client.api.anime.getWeeklySchedule()).filter(
		(anime) => new Date(anime.episodes.current.date).getDay() === new Date().getDay(),
	);

	const translate = (name: string) => {
		if (name === "mal") return "MyAnimeList";
		if (name === "hidive") return name.toUpperCase();
		return StringUtil.capitalize(name);
	};

	const messages = [];
	for (const { id, titles, url, image, episodes, streams, isDelayed } of schedule) {
		const notAiredYet = Date.now() < new Date(episodes.current.date).getTime();
		if (notAiredYet || isDelayed) continue;

		const { score, season, trackers } = await client.api.anime.getAnimeById({ id });

		const formattedTracking = trackers?.map(({ tracker, url }) => `> **[${translate(tracker)}](${url})**`);
		const formattedStreams = streams?.map(({ stream, url }) => `> **[${translate(stream)}](${url})**`);

		const embed = new EmbedBuilder()
			.setTitle(
				t("jobs.anime.episode.embed.title", {
					anime: StringUtil.truncate(titles.default, 240),
					episode: episodes.current.number,
				}),
			)
			.setURL(url)
			.setDescription(season ? `*${season}*` : null)
			.setThumbnail(image)
			.addFields([
				{
					name: t("jobs.anime.episode.embed.fields.0.name"),
					value: titles.alternative ?? t("common.unavailable"),
				},
				{
					name: t("jobs.anime.episode.embed.fields.1.name"),
					value: episodes.total
						? t("jobs.anime.episode.embed.fields.1.value", { episodes: episodes.total })
						: t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.anime.episode.embed.fields.2.name"),
					value: episodes.duration
						? t("jobs.anime.episode.embed.fields.2.value", { duration: episodes.duration })
						: t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.anime.episode.embed.fields.3.name"),
					value: score?.toString() ?? t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.anime.episode.embed.fields.4.name"),
					value: formattedStreams.join("\n") || t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.anime.episode.embed.fields.5.name"),
					value: formattedTracking.join("\n") || t("common.unavailable"),
					inline: true,
				},
			])
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.ANIME, messages });
};

import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { JobData, JobExecute } from "../../types/bot";

export const data: JobData = { schedule: "0 */5 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const schedule = (await client.api.aniList.getWeeklySchedule()).filter(
		({ airing }) => new Date(airing.sub.at ?? airing.raw.at).getDay() === new Date().getDay(),
	);

	const messages = [];
	for (const anime of schedule) {
		const { title, coverImage, format, airing, episodes, duration, streams, trackers, isDelayed, isMature } = anime;

		const notAiredYet = (airing.sub.at ?? airing.raw.at) > Date.now();
		if (notAiredYet || isDelayed || isMature) continue;

		const type = airing.sub.at ? "sub" : "raw";
		const formattedTracking = trackers?.map(({ name, url }) => `> **[${StringUtil.capitalize(name)}](${url})**`);
		const formattedStreams = streams?.map(({ name, url }) => `> **[${StringUtil.capitalize(name)}](${url})**`);

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title.english ?? title.romaji!))
			.setDescription(t("jobs.anime.episode.embed.description", { episode: airing.episode, type }))
			.setThumbnail(coverImage.extraLarge ?? coverImage.large ?? coverImage.medium)
			.addFields([
				{
					name: t("jobs.anime.episode.embed.fields.0.name"),
					value: formattedStreams.join("\n") || t("common.unavailable"),
					inline: true,
				},
				{
					name: t("jobs.anime.episode.embed.fields.1.name"),
					value: formattedTracking.join("\n") || t("common.unavailable"),
					inline: true,
				},
			])
			.setFooter({
				text: [
					format?.replace("_", " ") ?? null,
					episodes ? t("common.episodes.total", { total: episodes }) : null,
					duration ? t("common.episodes.duration", { duration }) : null,
				]
					.filter((item) => !!item)
					.join(" • "),
			})
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.ANIME, messages });
};

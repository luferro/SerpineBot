import { WebhookType } from "@luferro/database";
import { DateUtil, StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { JobData, JobExecute } from "../types/bot";

export const data: JobData = { schedule: "0 */10 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const latestChapters = await client.api.mangadex.getLatestChapters();
	const chaptersByManga = new Map(
		latestChapters
			.reverse()
			.map((manga) => [
				manga.mangaId,
				latestChapters.filter(
					({ mangaId, chapter }) =>
						mangaId === manga.mangaId &&
						new Date(chapter.readableAt).getTime() >= DateUtil.getPrevious(data.schedule).getTime(),
				),
			]),
	);

	const messages = [];
	for (const [mangaId, chapters] of chaptersByManga) {
		if (chapters.length === 0) continue;

		const { title, url, image, publication, tags } = await client.api.mangadex.getMangaById(mangaId);

		const formattedChapters = chapters
			.slice(0, 10)
			.reverse()
			.map(({ chapter }) => `**[${chapter.title}](${chapter.url})**`);
		const hiddenCount = chapters.length - formattedChapters.length;
		if (hiddenCount > 0) formattedChapters.push(t("common.lists.hidden", { size: hiddenCount }));

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setDescription(`*${publication}*`)
			.addFields([
				{
					name: t("jobs.manga.embed.fields.0.name"),
					value: tags.map((tag) => `\`${tag}\``).join() || t("common.unavailable"),
				},
				{
					name: t("jobs.manga.embed.fields.1.name"),
					value: formattedChapters.join("\n") || t("common.unavailable"),
				},
			])
			.setColor("Random");

		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.MANGA, messages });
};

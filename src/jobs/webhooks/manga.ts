import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Mangadex from '../../apis/mangadex';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';

export const data = {
	name: 'manga',
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	const chapters = await Mangadex.getLastestChapters();
	if (chapters.length === 0) return;

	const chaptersByManga = new Map(
		chapters
			.reverse()
			.map(({ mangaId }) => [
				mangaId,
				chapters.filter(({ mangaId: currentMangaId }) => currentMangaId === mangaId),
			]),
	);
	for (const [mangaId, mangaChapters] of chaptersByManga) {
		for (const { chapterId, title, url } of mangaChapters) {
			await SleepUtil.timeout(1000);

			const hasEntry = await client.manageState('Manga', 'Chapters', `${chapterId} - ${title}`, url);
			if (!hasEntry) continue;

			const chapterIndex = mangaChapters.findIndex(
				({ chapterId: currentChapterId }) => currentChapterId === chapterId,
			);
			mangaChapters.splice(chapterIndex);
			break;
		}
		if (mangaChapters.length === 0) continue;

		const { title, url, image } = await Mangadex.getMangaById(mangaId);
		if (!title && !url) continue;

		const formattedChapters = mangaChapters
			.slice(0, 10)
			.reverse()
			.map(({ title, url }) => `**[${title}](${url})**`);
		mangaChapters.length - formattedChapters.length > 0 &&
			formattedChapters.push(`And ${mangaChapters.length - formattedChapters.length} more!`);

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'Manga');
			if (!webhook) continue;

			await webhook.send({
				embeds: [
					new MessageEmbed()
						.setTitle(StringUtil.truncate(title))
						.setURL(url)
						.setThumbnail(image ?? '')
						.setDescription(formattedChapters.join('\n'))
						.setColor('RANDOM'),
				],
			});
		}
	}
};

import type { PlayStationBlogCategory } from '../types/category';
import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

const BlogCategories = Object.freeze<Record<PlayStationBlogCategory, string>>({
	'PlayStation Plus': 'https://blog.playstation.com/tag/playstation-plus/',
	'PlayStation Store': 'https://blog.playstation.com/tag/playstation-store/',
	'State Of Play': 'https://blog.playstation.com/tag/state-of-play/',
});

export const getLatestPlaystationBlogNews = async (category: PlayStationBlogCategory) => {
	const data = await FetchUtil.fetch<string>({ url: BlogCategories[category] });
	const $ = load(data);

	return $('.main-content article')
		.get()
		.map((element) => {
			const title = $(element).find('.post-card__content .post-card__title a').text().trim();
			const url = $(element).find('.post-card__content .post-card__title a').attr('href')!;
			const image = $(element).find('.post-card__image-link img').attr('data-src') ?? null;

			return { title, image, url };
		});
};

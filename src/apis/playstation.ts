import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import { PlaystationBlogCategory } from '../types/enums';

export const getLatestPlaystationBlogNews = async (category: PlaystationBlogCategory) => {
	const options: Record<typeof category, string> = {
		[PlaystationBlogCategory.PlaystationPlus]: 'https://blog.playstation.com/category/ps-plus/',
		[PlaystationBlogCategory.PlaystationStore]: 'https://blog.playstation.com/category/ps-store/',
		[PlaystationBlogCategory.StateOfPlay]: 'https://blog.playstation.com/tag/state-of-play/',
	};

	const data = await fetch<string>({ url: options[category] });
	const $ = load(data);

	return $('.main-content article')
		.get()
		.map((element) => {
			const title = $(element).find('.post-card__content .post-card__title a').text();
			const url = $(element).find('.post-card__content .post-card__title a').attr('href')!;
			const image = $(element).find('.post-card__image-link img').attr('src') ?? null;

			return {
				title,
				image,
				url,
			};
		});
};

import { StaticScraper } from '@luferro/scraper';

export enum Endpoint {
	LATEST_PLAYSTATION_PLUS = 'https://blog.playstation.com/tag/playstation-plus',
	LATEST_PLAYSTATION_STORE = 'https://blog.playstation.com/tag/playstation-store',
	LATEST_STATE_OF_PLAY = 'https://blog.playstation.com/tag/state-of-play',
}

export const getBlogList = async (url: string) => {
	const $ = await StaticScraper.load(url);

	return $('.main-content article')
		.get()
		.map((element) => {
			const title = $(element).find('.post-card__content .post-card__title a').text().trim();
			const url = $(element).find('.post-card__content .post-card__title a').attr('href')!;
			const image = $(element).find('.post-card__image-link img').attr('data-src')?.split('?')[0] ?? null;

			return { title, image, url };
		});
};

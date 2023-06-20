import { InteractiveScraper, StaticScraper } from '@luferro/scraper';

export enum Endpoint {
	LATEST_NEWS = 'https://todayin.games/',
}

export const getNewsList = async (url: Endpoint) => {
	const html = await InteractiveScraper.getHtml({ url });
	const $ = StaticScraper.loadHtml({ html });

	return $('div.post')
		.get()
		.map((element) => {
			const title = $(element).find('h2').first().text();
			const url = $(element).find('a').first().attr('href')!;
			const image = $(element).find('img').first().attr('src') ?? null;
			const publishedAt = new Date($(element).find('p.datetime').attr('title')!);

			return { title, url, image, publishedAt };
		});
};

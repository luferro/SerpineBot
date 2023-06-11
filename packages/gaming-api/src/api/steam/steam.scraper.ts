import { StaticScraper } from '@luferro/scraper';

export enum Endpoint {
	NEXT_SALES = 'https://prepareyourwallet.com',
	TOP_PLAYED = 'https://steamcharts.com',
	TOP_SELLERS = 'https://store.steampowered.com/search/?filter=topsellers&os=win',
	UPCOMING_GAMES = 'https://store.steampowered.com/search/?filter=popularcomingsoon&os=win',
}

export const getSteamList = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });

	return $('.search_result_row')
		.get()
		.map((element, index) => {
			const position = index + 1;
			const name = $(element).find('.responsive_search_name_combined .title').first().text();
			const url = $(element).first().attr('href')!;
			return { position, name, url };
		})
		.filter(({ url }, index, self) => index === self.findIndex(({ url: nestedUrl }) => nestedUrl === url))
		.slice(0, 10);
};

export const getChartsList = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });

	return $('table#top-games tbody tr')
		.get()
		.map((element, index) => {
			const position = index + 1;
			const name = $(element).find('.game-name a').text().trim();
			const href = $(element).find('.game-name a').attr('href');
			const url = `https://store.steampowered.com${href}`;
			const count = $(element).find('.num').first().text();

			return { position, name, url, count };
		});
};

export const getSalesList = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });

	const sale = $('p').first().attr('content') ?? null;
	const status = $('span.status').first().text();
	const upcoming = $('.row')
		.first()
		.children('div')
		.get()
		.map((element) => {
			const name = $(element).find('span').first().text();
			const date = $(element).find('p').first().text().trim();
			const fixedDate = date?.replace(/Confirmed|Not confirmed/, '').trim() ?? '';
			return `> __${name}__ ${fixedDate}`;
		});

	return { sale, status, upcoming };
};

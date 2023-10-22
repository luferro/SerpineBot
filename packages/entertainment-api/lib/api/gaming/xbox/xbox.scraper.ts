import { InteractiveScraper, StaticScraper } from '@luferro/scraper';

import { Gamertag } from '../../../types/args';

export const enum Chart {
	TOP_SELLERS = 1,
	TOP_PLAYED,
	UPCOMING_GAMES,
}

export const getGamertagData = async ({ gamertag }: Gamertag) => {
	const html = await InteractiveScraper.getHtml({ url: `https://xboxgamertag.com/search/${gamertag}` });
	const $ = StaticScraper.loadHtml({ html });

	const name = $('h1').first().text();
	const image = $('.avatar img').first().attr('src');
	const gamerscore = $('.profile-detail-item').first().text().match(/\d/g)?.join('') ?? 0;
	const gamesPlayed = $('.profile-detail-item').last().text().match(/\d/g)?.join('') ?? 0;

	return {
		name,
		image: image ? `https:${image.replace('&w=90&h=90', '')}` : null,
		gamerscore: Number(gamerscore),
		gamesPlayed: Number(gamesPlayed),
	};
};

export const getChartData = async ({ chart }: { chart: Chart }) => {
	const chartUrl: Record<typeof chart, string> = {
		[Chart.TOP_PLAYED]: 'https://www.microsoft.com/pt-pt/store/most-played/games/xbox',
		[Chart.TOP_SELLERS]: 'https://www.microsoft.com/pt-pt/store/top-paid/games/xbox',
		[Chart.UPCOMING_GAMES]: 'https://www.microsoft.com/pt-pt/store/coming-soon/games/xbox',
	};
	const $ = await StaticScraper.loadUrl({ url: chartUrl[chart] });

	return $('section > ul li')
		.get()
		.slice(0, 10)
		.map((element, index) => {
			const position = index + 1;
			const name = $(element).find('.card-body a').text();
			const url = $(element).find('.card-body a').attr('href')!;

			return { position, name, url };
		});
};

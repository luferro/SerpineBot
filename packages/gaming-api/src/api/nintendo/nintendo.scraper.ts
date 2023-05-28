import { StaticScraper } from '@luferro/scraper';

import { NintendoResponse } from '../../types/payload';

export enum Endpoint {
	LATEST_NEWS = 'https://www.nintendo.com/whatsnew',
}

export const getNewsList = async (url: Endpoint) => {
	const $ = await StaticScraper.load(url);

	const script = $('script[type="application/json"]').first().text();
	const {
		props: {
			pageProps: { initialApolloState },
		},
	} = JSON.parse(script) as NintendoResponse;

	return Object.values(initialApolloState)
		.filter(({ __typename }) => __typename === 'NewsArticle')
		.map(({ title, media, 'url({"relative":true})': href }) => ({
			title,
			url: `https://www.nintendo.com${href}`,
			image: media
				? `https://assets.nintendo.com/image/upload/q_auto/f_auto/c_fill,w_1200/${media.publicId}`
				: null,
		}));
};

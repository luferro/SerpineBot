import { StaticScraper } from '@luferro/scraper';

type Articles = {
	props: {
		pageProps: {
			initialApolloState: {
				[key: string]: {
					'__typename': string;
					'title': string;
					'media': { publicId: string };
					'publishDate': string;
					'url({"relative":true})': string;
				};
			};
		};
	};
};

export const getNewsData = async () => {
	const $ = await StaticScraper.loadUrl({ url: 'https://www.nintendo.com/whatsnew/' });

	const script = $('script[type="application/json"]').first().text();
	const { props } = JSON.parse(script) as Articles;
	const { initialApolloState } = props.pageProps;

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

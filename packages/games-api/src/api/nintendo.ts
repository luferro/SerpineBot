import type { NintendoResponse } from '../types/response';
import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

export const getLatestNintendoNews = async () => {
	const data = await FetchUtil.fetch<string>({ url: 'https://www.nintendo.com/whatsnew/' });
	const $ = load(data);

	const script = $('script[type="application/json"]').first().text();
	const {
		props: {
			pageProps: { initialApolloState },
		},
	} = JSON.parse(script) as NintendoResponse;

	return Object.values(initialApolloState)
		.filter(({ __typename }) => __typename === 'NewsArticle')
		.map(({ title, media, 'url({"relative":true})': url }) => ({
			title,
			url: `https://www.nintendo.com/${url}`,
			image: media
				? `https://assets.nintendo.com/image/upload/q_auto/f_auto/c_fill,w_1200/${media.publicId}`
				: null,
		}));
};

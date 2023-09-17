import { StaticScraper } from '@luferro/scraper';

import { Id } from '../../../types/args';

export const getComicData = async ({ id }: Id) => {
	let $ = await StaticScraper.loadUrl({ url: `https://www.gocomics.com/random/${id}` });

	const isRedirect = $('body').text().includes('redirected');
	if (isRedirect) {
		const redirectUrl = $('a').attr('href');
		if (redirectUrl) $ = await StaticScraper.loadUrl({ url: redirectUrl });
	}

	const title = $('.comic').attr('data-feature-name') ?? null;
	const author = $('.comic').attr('creator') ?? null;
	const url = $('.comic').attr('data-url') ?? null;
	const image = $('.comic').attr('data-image') ?? null;

	return {
		image,
		url,
		title: title === author ? title : `${title} by ${author}`,
	};
};

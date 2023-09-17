import { StaticScraper } from '@luferro/scraper';

import { Url } from '../../../types/args';

export const getImage = async ({ url }: Url) => {
	const $ = await StaticScraper.loadUrl({ url });
	return $('.featured-asset').first().attr('src')!;
};

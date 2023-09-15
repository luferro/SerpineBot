import { StaticScraper } from '@luferro/scraper';

export const getImage = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });
	return $('.featured-asset').first().attr('src')!;
};

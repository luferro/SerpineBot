import { StaticScraper } from '@luferro/scraper/lib';

export const getBlogPostImage = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });
	return $('.featured-asset').first().attr('src')!;
};

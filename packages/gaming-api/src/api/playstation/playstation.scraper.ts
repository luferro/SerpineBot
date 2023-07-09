import { StaticScraper } from '@luferro/scraper';

export const getBlogPostImage = async (url: string) => {
	const $ = await StaticScraper.loadUrl({ url });
	return $('.featured-asset').first().attr('src')!;
};

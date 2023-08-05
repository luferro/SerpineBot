import { RSS, StaticScraper } from '@luferro/scraper';

export enum Feed {
	SALES = 'https://gg.deals/news/deals/feed',
	BUNDLES = 'https://gg.deals/news/bundles/feed',
}

export const getDealsFeed = async ({ url }: { url: Feed }) => mapFeed({ data: await RSS.getFeed({ url }) });

const mapFeed = ({ data }: { data: Awaited<ReturnType<typeof RSS.getFeed>> }) => {
	return data.items.map(({ title, link, content, contentSnippet }) => {
		const $ = StaticScraper.loadHtml({ html: content! });
		const image = $('img').attr('src');
		return { title: title!, url: link!, description: contentSnippet!, image: image! };
	});
};

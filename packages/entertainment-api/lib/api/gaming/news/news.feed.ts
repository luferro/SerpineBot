import { RSS, StaticScraper } from '@luferro/scraper/lib';

export enum Feed {
	GAME_INFORMER = 'https://www.gameinformer.com/news.xml',
	EUROGAMER = 'https://www.eurogamer.net/feed',
	TECHRAPTOR = 'https://techraptor.net/gaming/feed',
	IGN = 'http://feeds.feedburner.com/ign/games-all',
	VERGE = 'https://www.theverge.com/rss/games/index.xml',
	ROCK_PAPER_SHOTGUN = 'https://www.rockpapershotgun.com/feed/news',
}

export const getNewsFeed = async ({ url }: { url: string }) => mapFeed({ data: await RSS.getFeed({ url }) });

const mapFeed = ({ data }: { data: Awaited<ReturnType<typeof RSS.getFeed>> }) => {
	return data.items.map(({ title, link, content, 'content:encoded': encodedContent, contentSnippet, isoDate }) => {
		const $ = StaticScraper.loadHtml({ html: encodedContent ?? content });
		const image = $('img').attr('src');
		return {
			title: title!,
			url: link!,
			description: contentSnippet!,
			image: image!,
			publishedAt: isoDate ? new Date(isoDate) : new Date(),
		};
	});
};

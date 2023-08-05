import { DateUtil } from '@luferro/shared-utils';

import { InteractiveScraper, StaticScraper } from '..';

type Interval = { start: Date | number; end?: Date | number };
type SearchEngineArgs = { query: string; interval?: Interval };

export const search = async ({ query, interval }: SearchEngineArgs) => {
	const url = [`https://duckduckgo.com/?q=${query}`];

	if (interval) {
		const fromStr = DateUtil.formatDate(interval.start, 'yyyy-MM-dd');
		const toStr = interval.end ? DateUtil.formatDate(interval.end, 'yyyy-MM-dd') : fromStr;
		url.push(`&df=${fromStr}..${toStr}`);
	}

	const html = await InteractiveScraper.getHtml({ url: url.join('') });
	const $ = StaticScraper.loadHtml({ html });
	return $('ol article[data-nrn="result"]')
		.get()
		.map((element) => {
			const name = $(element).find('h2').text();
			const url = $(element).find('div > a').attr('href');
			if (!name || !url) return;

			return { name, url };
		})
		.filter((element): element is NonNullable<typeof element> => !!element);
};
import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

type Url = { url: string };
type Html = { html: string };

export class StaticScraper {
	loadHtml({ html }: Html) {
		return load(html);
	}

	async loadUrl({ url }: Url) {
		const { payload } = await FetchUtil.fetch<string>({
			url,
			customHeaders: new Map([['content-type', 'plain/text']]),
		});
		return this.loadHtml({ html: payload });
	}
}

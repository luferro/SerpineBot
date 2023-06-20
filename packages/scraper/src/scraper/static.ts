import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

export const loadHtml = ({ html }: { html: string }) => load(html);

export const loadUrl = async ({ url }: { url: string }) => {
	const { payload } = await FetchUtil.fetch<string>({ url });
	return loadHtml({ html: payload });
};

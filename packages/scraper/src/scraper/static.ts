import { FetchUtil } from '@luferro/shared-utils';
import { load as _load } from 'cheerio';

export const load = async (url: string) => {
	const { payload } = await FetchUtil.fetch<string>({ url });
	return _load(payload);
};

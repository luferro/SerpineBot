import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getList } from './engine.scraper';

export const search = async (query: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.SEARCH_PAGE, query);
	return await getList(url);
};

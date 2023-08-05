import { EnumUtil } from '@luferro/shared-utils';

import { Endpoint, getComic } from './go-comics.scraper';

export const getRandomComic = async () => {
	const keys = EnumUtil.enumKeysToArray(Endpoint);
	const selection = keys[Math.floor(Math.random() * keys.length)];
	return await getComic(Endpoint[selection]);
};

import { GoogleApi } from '@luferro/google-api';
import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getReviewDetails } from './opencritic.scraper';

const getSlugFromId = async (id: string) => {
	const results = await GoogleApi.engine.search(`${id} site:https://opencritic.com/game`);
	const slug = results[0]?.url.split('/').at(5) ?? null;
	return { slug };
};

export const search = async (title: string) => {
	const results = await GoogleApi.engine.search(`${title} site:https://opencritic.com/game`);
	const id = results[0]?.url.split('/').at(4) ?? null;
	return { id };
};

export const getReviewById = async (id: string) => {
	const { slug } = await getSlugFromId(id);
	if (!slug) throw new Error(`Couldn't fetch reviews for game with id ${id}`);

	const url = StringUtil.format<Endpoint>(Endpoint.GAME_PAGE, id, slug);
	return await getReviewDetails(url);
};

import { SearchEngine } from '@luferro/scraper';
import { StringUtil, UrlUtil } from '@luferro/shared-utils';

import { Endpoint, getReviewsDetails } from './reviews.scraper';

const getUrlParameters = async (query: string) => {
	const interval = { start: Date.now() };
	const results = await SearchEngine.search({ query: `${query} site:https://opencritic.com/game`, interval });
	return {
		id: results[0]?.url.split('/').at(4) ?? null,
		slug: results[0]?.url.split('/').at(5) ?? null,
	};
};

export const search = async (title: string) => {
	const { id } = await getUrlParameters(title);
	return { id };
};

export const getReviewsById = async (id: string) => {
	const { slug } = await getUrlParameters(id);
	if (!slug) throw new Error(`Couldn't fetch reviews for game with id ${id}`);

	const url = StringUtil.format<Endpoint>(Endpoint.GAME_PAGE, id, slug);
	return await getReviewsDetails(url);
};

export const getReviewsForUrl = async (url: string) => {
	if (!UrlUtil.isValid(url)) throw new Error('Invalid url.');
	return await getReviewsDetails(url);
};

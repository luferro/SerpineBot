import { GoogleSearchApi } from '@luferro/google-api';
import { FetchUtil, logger } from '@luferro/shared-utils';
import { load } from 'cheerio';

import type { OpenCriticReview } from '../types/response';

const getSlugFromId = async (id: string) => {
	const results = await GoogleSearchApi.search(`${id} site:https://opencritic.com/game`);
	const slug = results[0]?.url.split('/').at(5) ?? null;

	return { slug };
};

export const search = async (title: string) => {
	const results = await GoogleSearchApi.search(`${title} site:https://opencritic.com/game`);
	logger.debug(JSON.stringify(results));
	const id = results[0]?.url.split('/').at(4) ?? null;

	return { id };
};

export const getReviewById = async (id: string) => {
	const { slug } = await getSlugFromId(id);
	if (!slug) throw new Error(`Couldn't fetch reviews for game with id ${id}`);

	const data = await FetchUtil.fetch<string>({ url: `https://opencritic.com/game/${id}/${slug}` });
	const $ = load(data);

	const tierDisplay = $('app-tier-display').first().find('img');
	const tier = tierDisplay.attr('data-cfsrc') ?? tierDisplay.attr('src');
	const score = $('app-score-orb').first().text().trim();
	const recommended = $('app-score-orb').last().text().trim();
	const script = $('app-json-ld').first().text();

	const { name, datePublished, gamePlatform, image, aggregateRating } = JSON.parse(script) as OpenCriticReview;

	return {
		name,
		tier: tier ? `https:${tier}` : null,
		url: `https://opencritic.com/game/${id}/${slug}`,
		releaseDate: datePublished.split('T')[0],
		image: image ?? null,
		count: aggregateRating?.ratingCount ?? null,
		score: score || null,
		recommended: recommended || null,
		platforms: gamePlatform.sort((a, b) => a.localeCompare(b)).map((name) => `> ${name}`),
	};
};

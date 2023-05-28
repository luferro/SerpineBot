import { StaticScraper } from '@luferro/scraper';

import { OpenCriticReview } from '../../types/payload';

export enum Endpoint {
	GAME_PAGE = 'https://opencritic.com/game/:id/:slug',
}

export const getReviewDetails = async (url: string) => {
	const $ = await StaticScraper.load(url);

	const tierDisplay = $('app-tier-display').first().find('img');
	const tier = tierDisplay.attr('data-cfsrc') ?? tierDisplay.attr('src');
	const score = $('app-score-orb').first().text().trim();
	const recommended = $('app-score-orb').last().text().trim();
	const script = $('app-json-ld').first().text();

	const { name, datePublished, gamePlatform, image, aggregateRating } = JSON.parse(script) as OpenCriticReview;

	return {
		name,
		url,
		tier: tier ? `https:${tier}` : null,
		releaseDate: datePublished.split('T')[0],
		image: image ?? null,
		count: aggregateRating?.ratingCount ?? null,
		score: score || null,
		recommended: recommended || null,
		platforms: gamePlatform.sort((a, b) => a.localeCompare(b)).map((name) => `> ${name}`),
	};
};

import { fetch } from '../services/fetch';
import * as Google from './google';
import * as StringUtil from '../utils/string';
import { Review } from '../types/responses';

export const search = async (title: string) => {
	const results = await Google.search(`${title} opencritic review`);
	const filteredResults = results.filter((item) => item.url.includes('https://opencritic.com'));
	return filteredResults[0]?.url.match(/\d+/g)?.[0];
};

export const getReviewById = async (id: string) => {
	const data = await fetch<Review>(`https://api.opencritic.com/api/game/${id}`);
	const {
		name,
		bannerScreenshot,
		firstReleaseDate,
		numReviews,
		topCriticScore,
		tier,
		percentRecommended,
		Platforms,
	} = data;

	return {
		name,
		tier,
		url: `https://opencritic.com/game/${id}/${StringUtil.slug(name)}`,
		releaseDate: firstReleaseDate.split('T')[0],
		image: bannerScreenshot ? `https:${bannerScreenshot.fullRes}` : null,
		count: numReviews,
		score: topCriticScore !== -1 ? Math.round(topCriticScore) : null,
		recommended: percentRecommended !== -1 ? Math.round(percentRecommended) : null,
		platforms: Platforms.map((platform) => `> ${platform.name}`),
	};
};

import { fetch } from '../services/fetch';
import * as StringUtil from '../utils/string';
import { Result, Review } from '../types/responses';

export const search = async (title: string) => {
    const data = await fetch<Result[]>(`https://api.opencritic.com/api/meta/search?criteria=${title}`);
    return data[0]?.id.toString();
}

export const getReviewById = async (id: string) => {
    const data = await fetch<Review>(`https://api.opencritic.com/api/game/${id}`);
    const { name, bannerScreenshot, firstReleaseDate, numReviews, topCriticScore, tier, percentRecommended, Platforms } = data;

    return {
        name,
        tier,
        url: `https://opencritic.com/game/${id}/${StringUtil.slug(name)}`,
        releaseDate: firstReleaseDate.split('T')[0],
        image: bannerScreenshot ? `https:${bannerScreenshot.fullRes}` : null,
        count: numReviews,
        score: topCriticScore !== -1 ? Math.round(topCriticScore) : null,
        recommended: percentRecommended !== -1 ? Math.round(percentRecommended) : null,
        platforms: Platforms.map(platform => `> ${platform.name}`)
    }
}
import { StaticScraper } from '@luferro/scraper';
import { DateUtil } from '@luferro/shared-utils';

import { Id, Slug } from '../../../types/args';

export const getReviewData = async ({ id, slug }: Id & Slug) => {
	const url = `https://opencritic.com/game/${id}/${slug}`;
	const $ = await StaticScraper.loadUrl({ url });

	const name = $('app-game-overview h1').first().text();
	const image = $('app-game-overview .top-container img').first().attr('src');
	const [date] = $('.platforms').text().split('-');
	const tierDisplay = $('app-tier-display').first().find('img');
	const tier = tierDisplay.attr('data-cfsrc') ?? tierDisplay.attr('src');
	const score = $('app-score-orb').first().text().trim();
	const recommended = $('app-score-orb').last().text().trim();
	const count = $('app-rapid-review-list a').first().text().match(/\d+/g)?.[0];
	const platforms = $('.platforms span')
		.map((_, element) => $(element).find('strong').text())
		.toArray();

	return {
		name,
		url,
		tier: tier ? (tier.startsWith('http') ? tier : `https:${tier}`) : null,
		releaseDate: date.trim() ? DateUtil.formatDate({ date: new Date(date) }).split(' ')[0] : null,
		image: image ? (image.startsWith('http') ? image : `https:${image}`) : null,
		count: count || null,
		score: score || null,
		recommended: recommended || null,
		platforms: platforms.sort((a, b) => a.localeCompare(b)).map((name) => `> ${name}`),
	};
};

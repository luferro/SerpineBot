import { SearchEngine } from '@luferro/scraper';
import { UrlUtil } from '@luferro/shared-utils';

import { Id, Query, Url } from '../../../types/args';
import { getReviewData } from './reviews.scraper';

export const search = async ({ query }: Query) => ({ id: (await extractParameters({ query })).id });

export const getReviewsById = async ({ id }: Id) => {
	const slug = (await extractParameters({ query: id })).slug!;
	return await getReviewData({ id, slug });
};

export const getReviewsForUrl = async ({ url }: Url) => {
	const { id, slug } = await extractParameters({ query: url });
	if (!id || !slug) throw new Error('Invalid review url.');
	return await getReviewData({ id, slug });
};

const extractParameters = async ({ query }: Query) => {
	const isQueryUrl = UrlUtil.isValid(query);
	const results = !isQueryUrl
		? await SearchEngine.search({
				query: `${query} site:https://opencritic.com/game`,
				interval: { start: Date.now() },
		  })
		: [];
	const url = !isQueryUrl ? results[0]?.url : query;
	return {
		id: url?.split('/').at(4) ?? null,
		slug: url?.split('/').at(5) ?? null,
	};
};

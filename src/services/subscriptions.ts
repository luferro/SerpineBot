import { fetch } from '../utils/fetch';
import { load } from 'cheerio';
import * as StringUtil from '../utils/string';
import * as UrlUtil from '../utils/url';
import * as TheMovieDB from '../apis/theMovieDB';
import { subscriptionsModel } from '../database/models/subscriptions';
import { TheMovieDBCategories } from '../types/categories';
import { SubscriptionsAggregate } from '../types/schemas';

export const getGamingSubscriptions = async (title: string) => {
	const regex = new RegExp(`^${StringUtil.slug(title).replace(/-/g, '.*-')}`);

	const subscriptions = (await subscriptionsModel.aggregate([
		{ $unwind: { path: '$items' } },
		{ $match: { 'items.slug': { $regex: regex } } },
	])) as unknown as SubscriptionsAggregate[];

	return subscriptions.map(({ name, items }) => ({
		name,
		entry: {
			name: items.name,
			url: items.url,
		},
	}));
};

export const getStreamingSubscriptions = async (title: string, category: TheMovieDBCategories) => {
	const id = await TheMovieDB.search(title, category);
	if (!id) return;

	const { url } = await TheMovieDB.getProviders(id, category);
	if (!url) return;

	const data = await fetch<string>({ url });
	const $ = load(data);

	const subscriptions = await Promise.all(
		$('.ott_provider')
			.get()
			.map(async (element) => {
				const isStreamProvider = $(element).find('h3').text() === 'Stream';
				if (!isStreamProvider) return;

				const regexMatch = $(element)
					.find('.providers a')
					.attr('title')
					?.match(/^\w+ (.*) on (.*)$/);
				if (!regexMatch) return;

				const { 1: entryName, 2: subscriptionName } = regexMatch;

				const url = $(element).find('.providers a').attr('href')!;
				const destinationUrl = await UrlUtil.getRedirectLocation(url);

				return {
					name: subscriptionName,
					entry: {
						name: entryName,
						url: destinationUrl,
					},
				};
			}),
	);

	return subscriptions.filter((subscription): subscription is NonNullable<typeof subscription> => !!subscription);
};

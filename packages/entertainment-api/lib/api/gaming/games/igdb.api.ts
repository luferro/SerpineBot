import { DateUtil, FetchUtil } from '@luferro/shared-utils';

import { Query } from '../../../types/args';

type SearchResult = { id: number; name: string; slug: string };

type Event = {
	name: string;
	description?: string;
	event_logo?: { url: string };
	event_networks?: { url: string }[];
	start_time: number;
	end_time?: number;
};

const getCustomHeaders = async () => {
	if (!process.env.IGDB_AUTHORIZATION) await authenticate();

	return new Map([
		['Authorization', `Bearer ${process.env.IGDB_AUTHORIZATION}`],
		['Client-ID', process.env.IGDB_CLIENT_ID!],
		['content-type', 'plain/text'],
	]);
};

const authenticate = async () => {
	if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_CLIENT_SECRET) {
		throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET are not set.');
	}

	const { payload } = await FetchUtil.fetch<{ access_token: string }>({
		method: 'POST',
		url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
	});
	process.env.IGDB_AUTHORIZATION = payload.access_token;
};

export const search = async ({ query }: Query) => {
	const { payload } = await FetchUtil.fetch<SearchResult[]>({
		method: 'POST',
		url: 'https://api.igdb.com/v4/games',
		customHeaders: await getCustomHeaders(),
		body: `fields id, name, slug; where name ~ "${query}"* & version_parent = null; limit 10;`,
		handleStatusCode: async (status) => status === 401 && (await authenticate()),
	});
	return payload.map(({ id, name, slug }) => ({ id: id.toString(), title: name, slug }));
};

export const getUpcomingEvents = async () => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	const timestamp = Math.floor(date.getTime() / 1000);
	const { payload } = await FetchUtil.fetch<Event[]>({
		method: 'POST',
		url: 'https://api.igdb.com/v4/events',
		customHeaders: await getCustomHeaders(),
		body: `fields name, description, event_logo.url, event_networks.url, start_time, end_time; where start_time >= ${timestamp}; sort start_time asc;`,
		handleStatusCode: async (status) => status === 401 && (await authenticate()),
	});

	return payload.map(({ name, description, start_time, end_time, event_logo, event_networks }) => {
		const scheduledStartAt = DateUtil.isPast({ date: start_time * 1000 })
			? DateUtil.addMinutes({ date: Date.now(), amount: 10 })
			: start_time * 1000;
		const scheduledStartEnd = end_time
			? end_time * 1000
			: DateUtil.addDays({ date: scheduledStartAt, amount: 1 }).getTime();

		return {
			name,
			scheduledStartAt,
			scheduledStartEnd,
			image: event_logo ? `https:${event_logo.url.replace('t_thumb', 't_1080p')}` : null,
			description: description ?? null,
			url: {
				youtube: event_networks?.find(({ url }) => /youtube/.test(url))?.url ?? null,
				twitch: event_networks?.find(({ url }) => /twitch/.test(url))?.url ?? null,
			},
		};
	});
};

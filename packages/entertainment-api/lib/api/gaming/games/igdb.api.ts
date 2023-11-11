import { DateUtil, FetchUtil } from '@luferro/shared-utils';

import { Query } from '../../../types/args';

type Result = { id: number; name: string; slug: string };

type Event = {
	name: string;
	description?: string;
	event_logo?: { url: string };
	event_networks?: { url: string }[];
	start_time: number;
	end_time?: number;
};

export class IGDBApi {
	private static BASE_OAUTH_URL = 'https://id.twitch.tv';
	private static BASE_API_URL = 'https://api.igdb.com';

	private clientId: string;
	private clientSecret: string;
	private authorization?: string;

	constructor({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	private async authenticate() {
		const { payload } = await FetchUtil.fetch<{ access_token: string }>({
			method: 'POST',
			url: `${IGDBApi.BASE_OAUTH_URL}/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
		});
		this.authorization = payload.access_token;
	}

	private async getCustomHeaders() {
		if (!this.authorization) await this.authenticate();
		return new Map([
			['Authorization', `Bearer ${this.authorization}`],
			['Client-ID', this.clientId],
			['content-type', 'plain/text'],
		]);
	}

	private async handleStatusCode(status: number) {
		if (status === 401) await this.authenticate();
	}

	async search({ query }: Query) {
		const { payload } = await FetchUtil.fetch<Result[]>({
			method: 'POST',
			url: `${IGDBApi.BASE_API_URL}/v4/games`,
			customHeaders: await this.getCustomHeaders(),
			body: `fields id, name, slug; where name ~ "${query}"* & version_parent = null; limit 10;`,
			handleStatusCode: (status) => this.handleStatusCode(status),
		});
		return payload.map(({ id, name, slug }) => ({ id: id.toString(), title: name, slug }));
	}

	async getUpcomingEvents() {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const timestamp = Math.floor(date.getTime() / 1000);

		const { payload } = await FetchUtil.fetch<Event[]>({
			method: 'POST',
			url: `${IGDBApi.BASE_API_URL}/v4/events`,
			customHeaders: await this.getCustomHeaders(),
			body: `fields name, description, event_logo.url, event_networks.url, start_time, end_time; where start_time >= ${timestamp}; sort start_time asc;`,
			handleStatusCode: (status) => this.handleStatusCode(status),
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
	}
}

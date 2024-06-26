import { addMinutes, endOfDay, isPast } from "@luferro/helpers/datetime";
import { fetcher } from "@luferro/helpers/fetch";
import type { Event, Result } from "./igdb.types.js";

export class IGDBApi {
	private static BASE_OAUTH_URL = "https://id.twitch.tv";
	private static BASE_API_URL = "https://api.igdb.com";

	private authorization?: string;

	constructor(
		private clientId: string,
		private clientSecret: string,
	) {}

	private async authenticate() {
		const { payload } = await fetcher<{ access_token: string }>(
			`${IGDBApi.BASE_OAUTH_URL}/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
			{ method: "POST" },
		);
		this.authorization = payload.access_token;
	}

	private async getHeaders() {
		if (!this.authorization) await this.authenticate();
		return new Map([
			["Authorization", `Bearer ${this.authorization}`],
			["Client-ID", this.clientId],
			["content-type", "plain/text"],
		]);
	}

	private async handleStatusCode(status: number) {
		if (status === 401) await this.authenticate();
	}

	async search(query: string) {
		const { payload } = await fetcher<Result[]>(`${IGDBApi.BASE_API_URL}/v4/games`, {
			method: "POST",
			headers: await this.getHeaders(),
			body: `fields id, name, slug; where name ~ "${query}"* & version_parent = null; limit 10;`,
			cb: (status) => this.handleStatusCode(status),
		});
		return payload.map(({ id, name, slug }) => ({ id: id.toString(), title: name, slug }));
	}

	async getUpcomingEvents() {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const timestamp = Math.floor(date.getTime() / 1000);

		const { payload } = await fetcher<Event[]>(`${IGDBApi.BASE_API_URL}/v4/events`, {
			method: "POST",
			headers: await this.getHeaders(),
			body: `fields name, description, live_stream_url, event_logo.url, event_networks.url, start_time, end_time, created_at; where start_time >= ${timestamp}; sort start_time asc;`,
			cb: (status) => this.handleStatusCode(status),
		});

		return payload.map(({ name, description, live_stream_url, start_time, end_time, event_logo, event_networks }) => {
			const scheduledStartAt = isPast(start_time * 1000) ? addMinutes(Date.now(), 5) : start_time * 1000;
			const scheduledEndAt = end_time ? end_time * 1000 : endOfDay(scheduledStartAt).getTime();

			const urls = [live_stream_url, ...(event_networks?.map((event) => event.url) ?? [])].filter(
				(url): url is NonNullable<string> => !!url,
			);

			return {
				name,
				scheduledStartAt,
				scheduledEndAt,
				image: event_logo ? `https:${event_logo.url.replace("t_thumb", "t_1080p")}` : null,
				description: description ?? null,
				url: {
					youtube: urls.find((url) => /youtube/.test(url)) ?? null,
					twitch: urls.find((url) => /twitch/.test(url)) ?? null,
				},
			};
		});
	}
}

import { DateUtil, FetchUtil } from "@luferro/shared-utils";

import { Query } from "../../../../types/args";
import { Event, Result } from "./igdb.types";

export class IGDBApi {
	private static BASE_OAUTH_URL = "https://id.twitch.tv";
	private static BASE_API_URL = "https://api.igdb.com";

	private clientId: string;
	private clientSecret: string;
	private authorization?: string;

	constructor({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	private async authenticate() {
		const { payload } = await FetchUtil.fetch<{ access_token: string }>({
			method: "POST",
			url: `${IGDBApi.BASE_OAUTH_URL}/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
		});
		this.authorization = payload.access_token;
	}

	private async getCustomHeaders() {
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

	async search({ query }: Query) {
		const { payload } = await FetchUtil.fetch<Result[]>({
			method: "POST",
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
			method: "POST",
			url: `${IGDBApi.BASE_API_URL}/v4/events`,
			customHeaders: await this.getCustomHeaders(),
			body: `fields name, description, live_stream_url, event_logo.url, event_networks.url, start_time, end_time, created_at; where start_time >= ${timestamp}; sort start_time asc;`,
			handleStatusCode: (status) => this.handleStatusCode(status),
		});

		return payload.map(({ name, description, live_stream_url, start_time, end_time, event_logo, event_networks }) => {
			const scheduledStartAt = DateUtil.isPast(start_time * 1000)
				? DateUtil.addMinutes(Date.now(), 5)
				: start_time * 1000;
			const scheduledEndAt = end_time ? end_time * 1000 : DateUtil.endOfDay(scheduledStartAt).getTime();

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

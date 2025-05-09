import { type AugmentedRequest, type CacheOptions, ExtendedRESTDataSource } from "@luferro/graphql/server";
import { addMinutes, endOfDay, isPast } from "@luferro/utils/date";
import { cache } from "~/cache.js";

import type { Event, Result } from "./dtos/IgdbApiDtos.js";

export class IgdbDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://api.igdb.com/v4/";
	protected readonly clientId: string;
	protected readonly clientSecret: string;

	private getCacheKey() {
		return `${this.clientId}:${this.clientSecret}`;
	}

	constructor({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
		super();
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	protected async onUnauthorized() {
		const data = await this.post<{ access_token: string }>("https://id.twitch.tv/oauth2/token", {
			params: {
				client_id: this.clientId,
				client_secret: this.clientSecret,
				grant_type: "client_credentials",
			},
		});
		await cache.set(this.getCacheKey(), data.access_token);
	}

	protected override async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		if (!request.body) return;

		const token = await cache.getOrRefresh<string>(this.getCacheKey(), this.onUnauthorized.bind(this));
		if (!token) throw new Error("Cannot retrieve igdb access token.");

		request.headers.Authorization = `Bearer ${token}`;
		request.headers["Client-ID"] = this.clientId;
		request.headers["content-type"] = "plain/text";
	}

	async search(query: string) {
		const data = await this.post<Result[]>("games", {
			body: `fields id, name, slug; where name ~ "${query}"* & version_parent = null; limit 10;`,
		});
		return data.map(({ id, name, slug }) => ({ id: id.toString(), title: name, slug }));
	}

	async getUpcomingEvents() {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const timestamp = Math.floor(date.getTime() / 1000);

		const data = await this.post<Event[]>("events", {
			body: `fields checksum, name, description, live_stream_url, event_logo.url, event_networks.url, start_time, end_time, created_at; where start_time >= ${timestamp}; sort start_time asc;`,
		});

		return data.map(
			({ checksum, name, description, live_stream_url, start_time, end_time, event_logo, event_networks }) => {
				const scheduledStartAt = isPast(start_time * 1000) ? addMinutes(Date.now(), 5).getTime() : start_time * 1000;
				const scheduledEndAt = end_time ? end_time * 1000 : endOfDay(scheduledStartAt).getTime();

				const urls = [live_stream_url, ...(event_networks?.map((event) => event.url) ?? [])].filter(
					(url): url is NonNullable<string> => !!url,
				);

				return {
					name,
					scheduledStartAt,
					scheduledEndAt,
					id: checksum,
					image: event_logo ? `https:${event_logo.url.replace("t_thumb", "t_1080p")}` : null,
					description: description ?? null,
					url: {
						youtube: urls.find((url) => /youtube/.test(url)) ?? null,
						twitch: urls.find((url) => /twitch/.test(url)) ?? null,
					},
				};
			},
		);
	}
}

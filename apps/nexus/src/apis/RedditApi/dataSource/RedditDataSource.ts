import { isVideo } from "@luferro/utils/youtube";
import { cache } from "~/cache.js";

import { type AugmentedRequest, type CacheOptions, ExtendedRESTDataSource } from "@luferro/graphql/server";
import type { RedditPostsInput } from "~/model/schema.generated.js";
import type { Posts } from "./dtos/RedditApiDtos.js";

export class RedditDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://oauth.reddit.com";
	protected readonly clientId: string;
	protected readonly clientSecret: string;

	constructor({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
		super();
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	private getCacheKey() {
		return this.clientId;
	}

	protected async onUnauthorized() {
		const data = await this.post<{ access_token: string }>("https://www.reddit.com/api/v1/access_token", {
			headers: {
				Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
			},
			params: {
				grant_type: "client_credentials",
			},
		});
		await cache.set(this.getCacheKey(), data.access_token);
	}

	protected override async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		if (request.method === "POST") return;

		const token = await cache.getOrRefresh<string>(this.getCacheKey(), this.onUnauthorized.bind(this));
		if (!token) throw new Error("Cannot retrieve reddit access token.");

		request.headers.Authorization = `Bearer ${token}`;
	}

	async getPosts({ subreddit, flairs = [], sort = "hot", limit = 100 }: RedditPostsInput) {
		const posts = await this.get<Posts>(flairs.length > 0 ? `r/${subreddit}/search` : `r/${subreddit}/${sort}`, {
			params: {
				...(flairs.length > 0 && {
					q: flairs.map((flair) => `flair_name:"${flair}"`).join(" OR "),
					sort,
				}),
				limit: limit.toString(),
				restrict_sr: "on",
			},
		});

		return posts.data.children
			.filter(({ data }) => !data.stickied || !data.removed_by_category)
			.sort((a, b) => b.data.created_utc - a.data.created_utc)
			.map(({ data }) => {
				const url = this.getUrl(data);
				const gallery =
					data.gallery_data?.items.map(({ media_id }) => {
						const extension = data.media_metadata?.[media_id].m.split("/")[-1] ?? "jpg";
						return { url: `https://i.redd.it/${media_id}.${extension}` };
					}) ?? [];

				return {
					url,
					gallery,
					id: data.id,
					title: data.title,
					selfurl: `https://www.reddit.com${data.permalink}`,
					selftext: data.selftext || null,
					isSelf: Boolean(data.is_self),
					isCrosspost: Boolean(data.crosspost_parent),
					isNsfw: Boolean(data.over_18),
					isGallery: Boolean(data.is_gallery),
					isImage: /\.(jpg|jpeg|png|webp)/.test(data.url),
					isVideo: Boolean(data.secure_media) || /\.(gif|gifv|mp4)/.test(url),
					isYoutubeEmbed: data.secure_media?.type === "youtube.com" || isVideo(url),
					publishedAt: new Date(data.created_utc * 1000),
				};
			});
	}

	private getUrl = (data: Posts["data"]["children"][0]["data"]) => {
		let url = data.url;
		if (data.url.startsWith("/r/")) url = "https://www.reddit.com".concat(data.url);
		if (data.secure_media?.reddit_video) url = data.secure_media.reddit_video.fallback_url;
		return url;
	};
}

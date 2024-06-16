import { fetcher } from "@luferro/helpers/fetch";
import { Scraper } from "@luferro/scraper";

type Payload<T> = { data: T };
type Children<T> = { children: T };
type Data<T> = { data: T };

type Post = {
	title: string;
	selftext: string | null;
	url: string;
	permalink: string;
	thumbnail: string;
	secure_media?: { type: string };
	is_gallery: boolean;
	gallery_data?: { items: { media_id: string }[] };
	is_self: boolean;
	crosspost_parent: boolean | null;
	stickied: boolean;
	is_video: boolean;
	removed_by_category: boolean | null;
	created_utc: number;
	over_18: boolean;
};

export class RedditApi {
	private static BASE_OAUTH_URL = "https://www.reddit.com/api";
	private static BASE_API_URL = "https://oauth.reddit.com";

	private authorization?: string;
	private scraper: Scraper;

	constructor(
		private clientId: string,
		private clientSecret: string,
	) {
		this.scraper = new Scraper();
	}

	private async authenticate() {
		const { payload } = await fetcher<{ access_token: string }>(
			`${RedditApi.BASE_OAUTH_URL}/v1/access_token?grant_type=client_credentials`,
			{
				method: "POST",
				headers: new Map([
					["Authorization", `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`],
				]),
			},
		);
		this.authorization = payload.access_token;
	}

	private async getHeaders() {
		if (!this.authorization) await this.authenticate();
		return new Map([["Authorization", `Bearer ${this.authorization}`]]);
	}

	private async handleStatusCode(status: number) {
		if (status === 401) await this.authenticate();
	}

	async getPosts(subreddit: string, { flairs = [] as string[], sort = "hot", limit = 100 } = {}) {
		let url = `${RedditApi.BASE_API_URL}/r/${subreddit}/${sort}?limit=${limit}&restrict_sr=on`;
		if (flairs.length > 0) {
			const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(" OR ");
			url = `${RedditApi.BASE_API_URL}/r/${subreddit}/search?q=${flair}&limit=${limit}&sort=${sort}&restrict_sr=on`;
		}

		const { payload } = await fetcher<Payload<Children<Data<Post>[]>>>(url, {
			headers: await this.getHeaders(),
			cb: (status) => this.handleStatusCode(status),
		});
		return payload.data.children
			.filter(({ data }) => !data.stickied || !data.removed_by_category)
			.sort((a, b) => b.data.created_utc - a.data.created_utc)
			.map(({ data }) => {
				const isTwitterEmbed = /^(?:https?:)?(?:\/\/)?(?:www\.)?(twitter.com|x.com)/.test(data.url);
				const url = data.url.startsWith("/r/") ? `https://www.reddit.com${data.url}` : data.url;
				const gallery =
					data.gallery_data?.items.map((item) => ({ url: `https://i.redd.it/${item.media_id}.jpg` })) ?? [];

				return {
					isTwitterEmbed,
					gallery,
					title: data.title,
					url: isTwitterEmbed ? url.split("?")[0] : url,
					selfurl: `https://www.reddit.com${data.permalink}`,
					selftext: data.selftext || null,
					isSelf: Boolean(data.is_self),
					isCrosspost: Boolean(data.crosspost_parent),
					isNsfw: Boolean(data.over_18),
					isGallery: Boolean(data.is_gallery),
					isImage: /\.(jpg|jpeg|png|webp)/.test(data.url),
					publishedAt: new Date(data.created_utc * 1000),
					isYoutubeEmbed: data.secure_media?.type === "youtube.com" || this.scraper.youtube.isVideo(url),
					hasEmbeddedMedia: Boolean(data.secure_media) || /\.(gif|gifv|mp4)/.test(url),
				};
			});
	}
}

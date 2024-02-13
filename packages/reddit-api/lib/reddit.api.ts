import { Scraper } from "@luferro/scraper";
import { FetchUtil } from "@luferro/shared-utils";

type Url = { url: string };
type Subreddit = { subreddit: string };
type Sort = { sort: "new" | "hot" | "top" };
type Flairs = { flairs: string[] };
type Limit = { limit: number };

type PostsQuery = Subreddit & Partial<Sort> & Partial<Limit>;
type PostsWithFlairsQuery = PostsQuery & Flairs;

type Payload<T> = { data: T };
type Children<T> = { children: T };

type Post = {
	data: {
		title: string;
		selftext: string | null;
		url: string;
		permalink: string;
		secure_media?: { type: string };
		gallery_data?: { items: { media_id: string }[] };
		is_self: boolean;
		crosspost_parent: boolean | null;
		stickied: boolean;
		is_video: boolean;
		removed_by_category: boolean | null;
		created_utc: number;
	};
};

export class RedditApi extends Scraper {
	private static BASE_URL = "https://old.reddit.com";

	private async getPostsByUrl({ url }: Url) {
		const { payload } = await FetchUtil.fetch<Payload<Children<Post[]>>>({ url });
		if (!payload?.data?.children) throw new Error("Failed to retrieve reddit post.");

		return payload.data.children
			.filter(({ data }) => !data.stickied || !data.removed_by_category)
			.sort((a, b) => b.data.created_utc - a.data.created_utc)
			.map(({ data }) => {
				const isTwitterEmbed = /^(?:https?:)?(?:\/\/)?(?:www\.)?(twitter.com|x.com)/.test(data.url);
				const url = isTwitterEmbed
					? data.url.split("?")[0].replace("twitter.com", "vxtwitter.com").replace("x.com", "fixvx.com")
					: data.url;

				return {
					url,
					isTwitterEmbed,
					title: data.title,
					selftext: data.selftext,
					selfurl: `${RedditApi.BASE_URL}${data.permalink}`,
					isCrosspost: Boolean(data.crosspost_parent),
					isSelf: data.is_self,
					isYoutubeEmbed: data.secure_media?.type === "youtube.com" || this.youtube.isVideo({ url: data.url }),
					gallery: data.gallery_data,
					publishedAt: new Date(data.created_utc),
					hasEmbeddedMedia: Boolean(data.secure_media) || /\.(gif|gifv|mp4)/.test(data.url),
				};
			});
	}

	async getPosts({ subreddit, sort = "hot", limit = 100 }: PostsQuery) {
		return this.getPostsByUrl({
			url: `${RedditApi.BASE_URL}/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`,
		});
	}

	async getPostsByFlair({ subreddit, flairs, sort = "hot", limit = 100 }: PostsWithFlairsQuery) {
		if (flairs.length === 0) throw new Error("Empty flair array.");
		const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(" OR ");

		return this.getPostsByUrl({
			url: `${RedditApi.BASE_URL}/r/${subreddit}/search.json?q=${flair}&limit=${limit}&sort=${sort}&restrict_sr=1`,
		});
	}
}

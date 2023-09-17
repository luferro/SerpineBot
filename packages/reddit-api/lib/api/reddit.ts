import { FetchUtil } from '@luferro/shared-utils';

type Url = { url: string };
type Subreddit = { subreddit: string };
type Sort = { sort: 'new' | 'hot' | 'top' };
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

export const getPosts = async ({ subreddit, sort = 'hot', limit = 100 }: PostsQuery) => {
	const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`;
	return await mapPosts({ url });
};

export const getPostsByFlair = async ({ subreddit, flairs, sort = 'hot', limit = 100 }: PostsWithFlairsQuery) => {
	if (flairs.length === 0) throw new Error('Flair array cannot be empty.');

	const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(' OR ');
	const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&limit=${limit}&sort=${sort}&restrict_sr=1`;
	return await mapPosts({ url });
};

const mapPosts = async ({ url }: Url) => {
	const { payload } = await FetchUtil.fetch<Payload<Children<Post[]>>>({ url });
	if (!payload?.data?.children) throw new Error('Failed to retrieve reddit post.');

	return payload.data.children
		.filter(({ data }) => !data.stickied && !data.is_video && !data.removed_by_category)
		.sort((a, b) => b.data.created_utc - a.data.created_utc)
		.map(({ data }) => ({
			title: data.title,
			url: data.url,
			selftext: data.selftext,
			selfurl: `https://www.reddit.com${data.permalink}`,
			isCrosspost: Boolean(data.crosspost_parent),
			isSelf: data.is_self,
			embedType: data.secure_media?.type ?? null,
			gallery: data.gallery_data,
			publishedAt: new Date(data.created_utc),
			hasEmbeddedMedia:
				Boolean(data.secure_media) ||
				['.gif', '.gifv', '.mp4'].some((extension) => data.url.includes(extension)),
		}));
};

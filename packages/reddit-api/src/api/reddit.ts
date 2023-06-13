import { FetchUtil } from '@luferro/shared-utils';

type Sort = 'new' | 'hot' | 'top';

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
		preview?: { reddit_video_preview?: { fallback_url: string } };
		is_self: boolean;
		crosspost_parent: boolean | null;
		stickied: boolean;
		is_video: boolean;
		removed_by_category: boolean | null;
		created_utc: number;
	};
};

export const getPosts = async (subreddit: string, sort: Sort = 'hot', limit = 100) => {
	const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`;
	return await getPostsList(url);
};

export const getPostsByFlair = async (subreddit: string, flairs: string[], sort: Sort = 'hot', limit = 100) => {
	if (flairs.length === 0) throw new Error("Flair array can't be empty.");

	const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(' OR ');
	const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&limit=${limit}&sort=${sort}&restrict_sr=1`;
	return await getPostsList(url);
};

const getPostsList = async (url: string) => {
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
			fallback: data.preview,
			publishedAt: new Date(data.created_utc),
			hasEmbeddedMedia:
				Boolean(data.secure_media) ||
				['.gif', '.gifv', '.mp4'].some((extension) => data.url.includes(extension)),
		}));
};

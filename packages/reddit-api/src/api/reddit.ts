import { FetchUtil } from '@luferro/shared-utils';

import type { RedditChildren, RedditPayload, RedditPost } from '../types/payload';

type Sort = 'new' | 'hot' | 'top';

export const getPosts = async (subreddit: string, sort: Sort = 'hot', limit = 100) => {
	const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`;
	const data = await FetchUtil.fetch<RedditPayload<RedditChildren<RedditPost[]>>>({ url });
	return extract(data);
};

export const getPostsByFlair = async (subreddit: string, flairs: string[], sort: Sort = 'hot', limit = 100) => {
	if (flairs.length === 0) throw new Error("Flair array can't be empty.");

	const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(' OR ');
	const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&limit=${limit}&sort=${sort}&restrict_sr=1`;
	const data = await FetchUtil.fetch<RedditPayload<RedditChildren<RedditPost[]>>>({ url });
	return extract(data);
};

const extract = (post: RedditPayload<RedditChildren<RedditPost[]>>) => {
	if (!post?.data?.children) throw new Error('Failed to retrieve reddit post.');

	return post.data.children
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
			hasEmbeddedMedia:
				Boolean(data.secure_media) ||
				['.gif', '.gifv', '.mp4'].some((extension) => data.url.includes(extension)),
		}));
};

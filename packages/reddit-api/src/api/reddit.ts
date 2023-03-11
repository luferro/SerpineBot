import { FetchUtil, FileUtil } from '@luferro/shared-utils';

import type { RedditSort } from '../types/reddit';
import type { RedditPost } from '../types/response';

const extractRelevantDataFromPost = async (post: RedditPost) => {
	if (!post?.data?.children) throw new Error('Failed to retrieve reddit post.');

	const data = post.data.children
		.filter((post) => !post.data.stickied && !post.data.is_video && !post.data.removed_by_category)
		.sort((a, b) => b.data.created_utc - a.data.created_utc)
		.map((post) => ({
			title: post.data.title,
			url: post.data.url,
			selftext: post.data.selftext,
			selfurl: `https://www.reddit.com${post.data.permalink}`,
			isCrosspost: Boolean(post.data.crosspost_parent),
			isSelf: post.data.is_self,
			embedType: post.data.secure_media?.type ?? null,
			gallery: post.data.gallery_data,
			fallback: post.data.preview,
			hasEmbeddedMedia:
				Boolean(post.data.secure_media) ||
				['.gif', '.gifv', '.mp4'].some((extension) => post.data.url.includes(extension)),
		}));

	for (const [index, post] of data.entries()) {
		const isUrlReachable = await FileUtil.isReachable(post.url);
		if (post.title && isUrlReachable) continue;

		data.splice(index);
	}

	return data;
};

export const getPosts = async (subreddit: string, sort: RedditSort = 'hot', limit = 100) => {
	const post = await FetchUtil.fetch<RedditPost>({
		url: `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`,
	});

	return extractRelevantDataFromPost(post);
};

export const getPostsByFlair = async (subreddit: string, sort: RedditSort = 'hot', flairs: string[], limit = 100) => {
	if (flairs.length === 0) throw new Error("Flair array can't be empty.");
	const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(' OR ');

	const post = await FetchUtil.fetch<RedditPost>({
		url: `https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&limit=${limit}&sort=${sort}&restrict_sr=1`,
	});

	return extractRelevantDataFromPost(post);
};

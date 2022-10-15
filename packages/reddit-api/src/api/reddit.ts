import type { RedditSort } from '../types/reddit';
import type { RedditPost } from '../types/response';
import { FetchUtil } from '@luferro/shared-utils';

const extractRelevantDataFromPost = async (post: RedditPost) => {
	if (!post?.data?.children) throw new Error('Failed to retrieve reddit post.');

	return (post.data.children ?? [])
		.filter(
			({ data: { stickied, is_video, removed_by_category } }) => !stickied && !is_video && !removed_by_category,
		)
		.sort((a, b) => b.data.created_utc - a.data.created_utc)
		.map(
			({
				data: {
					title,
					permalink,
					url,
					selftext,
					gallery_data,
					preview,
					secure_media,
					is_self,
					crosspost_parent,
				},
			}) => ({
				title,
				url,
				selftext,
				selfurl: `https://www.reddit.com${permalink}`,
				isCrosspost: Boolean(crosspost_parent),
				isSelf: is_self,
				hasEmbeddedMedia: Boolean(secure_media),
				embedType: secure_media?.type ?? null,
				gallery: gallery_data,
				fallback: preview,
			}),
		);
};

export const getPosts = async (subreddit: string, sort: RedditSort = 'hot', limit = 100) => {
	const post = await FetchUtil.fetch<RedditPost>({
		url: `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`,
	});

	return extractRelevantDataFromPost(post);
};

export const getPostsByFlair = async (subreddit: string, sort: RedditSort = 'hot', flairs: string[]) => {
	if (flairs.length === 0) throw new Error("Flair array can't be empty.");
	const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(' OR ');

	const post = await FetchUtil.fetch<RedditPost>({
		url: `https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&sort=${sort}&restrict_sr=1`,
	});

	return extractRelevantDataFromPost(post);
};

import { fetch } from '../services/fetch';
import { Post } from '../types/responses';

export const getPosts = async (subreddit: string, sort = 'hot', limit = 100) => {
	const data = await fetch<Post>(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`);
	const { children } = data.data;

	const filteredData = children.filter(
		(item) => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category,
	);
	return filteredData.sort((a, b) => b.data.created_utc - a.data.created_utc);
};

export const getPostsByFlair = async (subreddit: string, sort = 'hot', flairs: string[]) => {
	if (flairs.length === 0) throw new Error("Flair array can't be empty.");

	const flair = flairs.map((item) => `flair_name:"${item}"`).join(' OR ');
	const data = await fetch<Post>(
		`https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&sort=${sort}&restrict_sr=1`,
	);
	const { children } = data.data;

	const filteredData = children.filter(
		(item) => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category,
	);
	return filteredData.sort((a, b) => b.data.created_utc - a.data.created_utc);
};

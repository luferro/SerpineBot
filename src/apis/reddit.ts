import { fetch } from '../services/fetch';
import { Post } from '../types/responses';

export const getPosts = async (subreddit: string, sort = 'hot', limit = 100) => {
	const {
		data: { children },
	} = await fetch<Post>(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&restrict_sr=1`);

	const filteredData = children.filter(
		({ data: { stickied, is_video, removed_by_category } }) => !stickied && !is_video && !removed_by_category,
	);
	return filteredData.sort((a, b) => b.data.created_utc - a.data.created_utc);
};

export const getPostsByFlair = async (subreddit: string, sort = 'hot', flairs: string[]) => {
	if (flairs.length === 0) throw new Error("Flair array can't be empty.");
	const flair = flairs.map((flair) => `flair_name:"${flair}"`).join(' OR ');

	const {
		data: { children },
	} = await fetch<Post>(`https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&sort=${sort}&restrict_sr=1`);

	const filteredData = children.filter(
		({ data: { stickied, is_video, removed_by_category } }) => !stickied && !is_video && !removed_by_category,
	);
	return filteredData.sort((a, b) => b.data.created_utc - a.data.created_utc);
};

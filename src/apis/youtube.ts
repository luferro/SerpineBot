import * as ytdl from 'play-dl';
import { fetch } from '../services/fetch';
import { Channel, Video } from '../types/responses';

export const isVideo = (url: string) => {
	return ytdl.yt_validate(url);
};

export const search = async (query: string, limit = 1) => {
	const data = await ytdl.search(query, { source: { youtube: 'video' }, limit });

	return data.map((item) => ({
		title: item.title ?? 'N/A',
		channel: item.channel?.name ?? 'N/A',
		url: item.url,
		thumbnail: item.thumbnails[0]?.url,
		duration: item.durationRaw,
		isLivestream: item.live,
	}));
};

export const getVideoId = (url: string) => {
	const newURL = url.includes('embed') ? url.split('/')[4] : url.split('/')[3];
	return newURL.match(/([A-z0-9_.\-~]{11})/g)![0];
};

export const getChannelId = async (url: string) => {
	const videoId = getVideoId(url);
	const data = await fetch<Video>(
		`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
	);

	return data.items[0]?.snippet.channelId;
};

export const getSubscribers = async (url: string) => {
	const isCustom = ['channel', 'user'].every((item) => !url.includes(item));
	const isIdType = isCustom || url.includes('channel');

	const queryOption = isIdType ? 'id' : 'forUsername';
	const channelId = await getChannelId(url);

	const data = await fetch<Channel>(
		`https://youtube.googleapis.com/youtube/v3/channels?part=statistics&${queryOption}=${channelId}&key=${process.env.YOUTUBE_API_KEY}`,
	);
	const subscriberCount = data.items?.[0].statistics?.subscriberCount ?? 0;

	return Number(subscriberCount);
};

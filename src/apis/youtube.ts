import * as ytdl from 'play-dl';
import { fetch } from '../utils/fetch';
import { Channel, Video } from '../types/responses';

export const isVideo = (url: string) => {
	return url.startsWith('https') && ytdl.yt_validate(url) === 'video';
};

export const isPlaylist = (url: string) => {
	return ytdl.yt_validate(url) === 'playlist';
};

export const search = async (query: string, limit = 1) => {
	const data = await ytdl.search(query, { source: { youtube: 'video' }, limit });

	return data.map(({ title, channel, url, thumbnails, durationRaw, live }) => ({
		title: title ?? 'N/A',
		channel: channel?.name ?? 'N/A',
		url,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: durationRaw,
		isLivestream: live,
	}));
};

export const getPlaylist = async (url: string) => {
	const playlist = await ytdl.playlist_info(url);
	const videos = await playlist.all_videos();

	const { title, channel, videoCount } = playlist;

	return {
		title: title ?? 'N/A',
		channel: channel?.name ?? 'N/A',
		url,
		count: videoCount ?? null,
		videos: videos.map(({ title, channel, url, thumbnails, durationRaw, live }) => ({
			title: title ?? 'N/A',
			channel: channel?.name ?? 'N/A',
			url,
			thumbnail: thumbnails[0]?.url ?? null,
			duration: durationRaw,
			isLivestream: live,
		})),
	};
};

export const getVideoId = (url: string) => {
	const newURL = url.includes('embed') ? url.split('/')[4] : url.split('/')[3];
	return newURL.match(/([A-z0-9_.\-~]{11})/g)![0];
};

export const getChannelId = async (url: string) => {
	const videoId = getVideoId(url);

	const { items } = await fetch<Video>({
		url: `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
	});

	return items[0]?.snippet.channelId;
};

export const getSubscribers = async (url: string) => {
	const isCustom = ['channel', 'user'].every((item) => !url.includes(item));
	const isIdType = isCustom || url.includes('channel');

	const queryOption = isIdType ? 'id' : 'forUsername';
	const channelId = await getChannelId(url);

	const { items } = await fetch<Channel>({
		url: `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&${queryOption}=${channelId}&key=${process.env.YOUTUBE_API_KEY}`,
	});

	return Number(items?.[0].statistics?.subscriberCount ?? 0);
};

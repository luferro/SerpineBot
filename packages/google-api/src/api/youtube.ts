import type { ChannelResponse, VideoResponse } from '../types/response';
import { FetchUtil } from '@luferro/shared-utils';
import * as ytdl from 'play-dl';

let API_KEY: string;

export const setApiKey = (apiKey: string) => {
	API_KEY = apiKey;
};

export const isVideo = (url: string) => {
	return url.startsWith('https') && ytdl.yt_validate(url) === 'video';
};

export const isPlaylist = (url: string) => {
	return url.startsWith('https') && ytdl.yt_validate(url) === 'playlist';
};

export const stream = async (url: string) => {
	return await ytdl.stream(url);
};

export const seek = async (url: string, seek: number) => {
	return await ytdl.stream(url, { seek });
};

export const search = async (query: string, limit = 1) => {
	const data = await ytdl.search(query, { source: { youtube: 'video' }, limit });

	return data.map(({ title, channel, url, thumbnails, durationRaw, live }) => ({
		url,
		title: title ?? null,
		channel: channel?.name ?? null,
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
		url,
		title: title ?? null,
		channel: channel?.name ?? null,
		count: videoCount ?? null,
		videos: videos.map(({ title, channel, url, thumbnails, durationRaw, live }) => ({
			url,
			title: title ?? null,
			channel: channel?.name ?? null,
			thumbnail: thumbnails[0]?.url ?? null,
			duration: durationRaw,
			isLivestream: live,
		})),
	};
};

export const getVideoId = (url: string) => {
	const splitUrl = url.includes('embed') ? url.split('/')[4] : url.split('/')[3];
	return splitUrl.match(/([A-z0-9_.\-~]{11})/g)![0];
};

export const getChannelId = async (url: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const videoId = getVideoId(url);

	const { items } = await FetchUtil.fetch<VideoResponse>({
		url: `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
	});

	return items[0]?.snippet.channelId;
};

export const getSubscribers = async (url: string) => {
	if (!API_KEY) throw new Error('Missing api key.');

	const isCustom = ['channel', 'user'].every((item) => !url.includes(item));
	const isIdType = isCustom || url.includes('channel');

	const queryOption = isIdType ? 'id' : 'forUsername';
	const channelId = await getChannelId(url);

	const { items } = await FetchUtil.fetch<ChannelResponse>({
		url: `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&${queryOption}=${channelId}&key=${API_KEY}`,
	});

	return Number(items?.[0].statistics?.subscriberCount ?? 0);
};

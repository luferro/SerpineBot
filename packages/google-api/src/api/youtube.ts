import type { Video } from 'ytsr';
import { ConverterUtil } from '@luferro/shared-utils';
import * as playdl from 'play-dl';
import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';

export const isVideo = (url: string) => {
	try {
		const videoId = getVideoId(url);
		return ytdl.validateID(videoId);
	} catch (error) {
		return false;
	}
};

export const isPlaylist = async (url: string) => {
	try {
		const playlistId = await getPlaylistId(url);
		return ytpl.validateID(playlistId);
	} catch (error) {
		return false;
	}
};

export const stream = async (url: string, seek = 0) => {
	return await playdl.stream(url, { seek: seek === 0 ? seek : seek / 1000 });
};

export const search = async (query: string, limit = 1) => {
	const { items } = await ytsr(query, { limit });
	const videos = items.filter(({ type }) => type === 'video') as Video[];

	return videos.map(({ url, title, author, thumbnails, duration, isLive }) => ({
		url,
		title: title ?? null,
		channel: author?.name ?? null,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: duration ?? 'N/A',
		isLivestream: isLive,
	}));
};

export const getVideoDetails = async (url: string) => {
	const {
		videoDetails: { title, author, thumbnails, lengthSeconds, isLiveContent },
	} = await ytdl.getBasicInfo(url);

	return {
		url,
		title: title ?? null,
		channel: author?.name ?? null,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: ConverterUtil.toMinutes(Number(lengthSeconds) * 1000, true) as string,
		isLivestream: isLiveContent,
	};
};

export const getPlaylist = async (url: string) => {
	const playlist = await ytpl(url);
	const { title, author, estimatedItemCount, items } = playlist;

	return {
		url,
		title: title ?? null,
		channel: author?.name ?? null,
		count: estimatedItemCount ?? null,
		videos: items.map(({ url, title, author, thumbnails, duration, isLive }) => ({
			url,
			title: title ?? null,
			channel: author?.name ?? null,
			thumbnail: thumbnails[0]?.url ?? null,
			duration: duration ?? 'N/A',
			isLivestream: isLive,
		})),
	};
};

export const getVideoId = (url: string) => {
	return ytdl.getVideoID(url);
};

export const getPlaylistId = async (url: string) => {
	return await ytpl.getPlaylistID(url);
};

export const getChannelId = async (url: string) => {
	const {
		videoDetails: { author },
	} = await ytdl.getBasicInfo(url);

	return author.id;
};

export const getSubscribers = async (url: string) => {
	const {
		videoDetails: { author },
	} = await ytdl.getBasicInfo(url);

	return author.subscriber_count ?? 0;
};

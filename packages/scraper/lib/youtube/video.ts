import { ConverterUtil } from '@luferro/shared-utils';
import ytdl from 'ytdl-core';

export const isVideo = (url: string) => Boolean(getVideoId(url));

export const getVideoId = (url: string) => {
	try {
		return ytdl.getVideoID(url);
	} catch (error) {
		return null;
	}
};

export const getVideoInfo = async (url: string) => {
	const { videoDetails } = await ytdl.getBasicInfo(url);
	const { title, author, thumbnails, lengthSeconds, isLiveContent } = videoDetails;

	return {
		url,
		title: title ?? null,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: isLiveContent ? ConverterUtil.formatTime(Number(lengthSeconds) * 1000) : null,
		isLivestream: isLiveContent,
		channel: {
			id: author.id,
			name: author?.name ?? null,
			subscribers: author.subscriber_count ?? 0,
		},
	};
};

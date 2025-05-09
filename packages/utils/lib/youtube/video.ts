import ytdl from "ytdl-core";
import { formatDuration } from "../time/duration.js";

export function isVideo(url: string) {
	return Boolean(getVideoId(url));
}

export function getVideoId(url: string) {
	try {
		return ytdl.getVideoID(url);
	} catch (error) {
		return null;
	}
}

export async function getVideoInfo(url: string) {
	const { videoDetails } = await ytdl.getBasicInfo(url);
	const { title, author, thumbnails, lengthSeconds, isLiveContent } = videoDetails;

	return {
		url,
		title: title ?? null,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: isLiveContent ? formatDuration(Number(lengthSeconds) * 1000) : null,
		isLivestream: isLiveContent,
		channel: {
			id: author.id,
			name: author?.name ?? null,
			subscribers: author.subscriber_count ?? 0,
		},
	};
}

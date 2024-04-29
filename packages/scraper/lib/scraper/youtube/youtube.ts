import { formatTime } from "@luferro/helpers/datetime";
import ytdl from "ytdl-core";

export class Youtube {
	isVideo(url: string) {
		return Boolean(this.getVideoId(url));
	}

	getVideoId(url: string) {
		try {
			return ytdl.getVideoID(url);
		} catch (error) {
			return null;
		}
	}

	async getSubscribers(url: string) {
		try {
			const { videoDetails } = await ytdl.getBasicInfo(url);
			return videoDetails.author.subscriber_count ?? 0;
		} catch (error) {
			return -1;
		}
	}

	async getVideoInfo(url: string) {
		const { videoDetails } = await ytdl.getBasicInfo(url);
		const { title, author, thumbnails, lengthSeconds, isLiveContent } = videoDetails;

		return {
			url,
			title: title ?? null,
			thumbnail: thumbnails[0]?.url ?? null,
			duration: isLiveContent ? formatTime(Number(lengthSeconds) * 1000) : null,
			isLivestream: isLiveContent,
			channel: {
				id: author.id,
				name: author?.name ?? null,
				subscribers: author.subscriber_count ?? 0,
			},
		};
	}
}

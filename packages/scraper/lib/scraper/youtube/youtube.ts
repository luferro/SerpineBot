import { ConverterUtil } from '@luferro/shared-utils';
import ytdl from 'ytdl-core';

type Url = { url: string };

export class Youtube {
	isVideo({ url }: Url) {
		return Boolean(this.getVideoId({ url }));
	}

	getVideoId({ url }: Url) {
		try {
			return ytdl.getVideoID(url);
		} catch (error) {
			return null;
		}
	}

	async getSubscribers({ url }: Url) {
		try {
			const { videoDetails } = await ytdl.getBasicInfo(url);
			return videoDetails.author.subscriber_count ?? 0;
		} catch (error) {
			return -1;
		}
	}

	async getVideoInfo({ url }: Url) {
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
	}
}

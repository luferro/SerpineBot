import ytdl from "ytdl-core";

export async function getSubscribers(url: string) {
	try {
		const { videoDetails } = await ytdl.getBasicInfo(url);
		return videoDetails.author.subscriber_count ?? 0;
	} catch (error) {
		return -1;
	}
}

import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as FilesUtil from '../../utils/files';

export const data = {
	name: 'nsfw',
	schedule: '0 */5 * * * *',
};

export const execute = async (client: Bot) => {
	const subreddits = ['Boobs', 'Gonewild', 'RealGirls', 'BiggerThanYouThought', 'TittyDrop', 'BreedingMaterial'];
	for (const subreddit of subreddits) {
		const {
			0: {
				data: { title, permalink, url, secure_media, gallery_data },
			},
		} = await Reddit.getPosts(subreddit);

		const nsfwUrl = getUrl(url, secure_media?.oembed.thumbnail_url, gallery_data?.items[0]?.media_id);

		const isMediaAvailable = await FilesUtil.isAvailable(nsfwUrl);
		if (!isMediaAvailable) continue;

		const hasEntry = await client.manageState('NSFW', StringUtil.capitalize(subreddit), title, nsfwUrl);
		if (hasEntry) continue;

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, 'NSFW');
			if (!webhook) continue;

			const hasVideoExtension = ['gif', 'gifv', 'mp4'].some((item) => nsfwUrl.includes(item));
			if (secure_media || hasVideoExtension) {
				await webhook.send({
					content: `**[${StringUtil.truncate(title)}](<https://www.reddit.com${permalink}>)**\n${nsfwUrl}`,
				});
				continue;
			}

			await webhook.send({
				embeds: [
					new MessageEmbed()
						.setTitle(StringUtil.truncate(title))
						.setURL(`https://www.reddit.com${permalink}`)
						.setImage(nsfwUrl)
						.setColor('RANDOM'),
				],
			});
		}
	}
};

const getUrl = (url: string, mediaItem: string | undefined, galleryItem: string | undefined) => {
	if (mediaItem) return mediaItem.replace(mediaItem.split('-')[1], 'mobile.mp4');
	if (galleryItem) return `https://i.redd.it/${galleryItem}.jpg`;
	return url;
};

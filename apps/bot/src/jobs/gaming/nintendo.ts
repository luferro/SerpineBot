import { WebhookType } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const posts = await client.api.reddit.getPostsByFlair({
		subreddit: 'NintendoSwitch',
		sort: 'new',
		flairs: ['News', 'Nintendo Official'],
	});

	const messages = [];
	for (const { title, url, isTwitterEmbed, isYoutubeEmbed, isSelf } of posts.reverse()) {
		if (isSelf) continue;

		if (isTwitterEmbed || isYoutubeEmbed) {
			messages.push(`**${title}**\n${url}`);
			continue;
		}

		const embed = new EmbedBuilder().setTitle(StringUtil.truncate(title)).setURL(url).setColor('Random');
		messages.push(embed);
	}

	await client.propagate({ type: WebhookType.NINTENDO, messages });
};

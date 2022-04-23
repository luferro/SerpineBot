import { MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import * as Reddit from '../../apis/reddit';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';

export const data = {
	name: 'nintendo',
	schedule: '0 */3 * * * *',
};

export const execute = async (client: Bot) => {
	const {
		0: {
			data: { title, url, secure_media, is_self, crosspost_parent },
		},
	} = await Reddit.getPostsByFlair('NintendoSwitch', 'new', ['News']);

	const hasEntry = await client.manageState('Nintendo', 'News', title, url);
	if (hasEntry || crosspost_parent || is_self) return;

	for (const { 0: guildId } of client.guilds.cache) {
		const webhook = await Webhooks.getWebhook(client, guildId, 'Nintendo');
		if (!webhook) continue;

		if (secure_media) {
			await webhook.send({ content: `**${StringUtil.truncate(title)}**\n${url}` });
			continue;
		}

		await webhook.send({
			embeds: [new MessageEmbed().setTitle(StringUtil.truncate(title)).setURL(url).setColor('RANDOM')],
		});
	}
};

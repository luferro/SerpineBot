import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { CommandExecute } from '../types/bot';

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const posts = await client.api.reddit.getPosts('Memes');
	const { title, url, selfurl, hasEmbeddedMedia } = posts[Math.floor(Math.random() * posts.length)];

	if (hasEmbeddedMedia) {
		const content = `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}`;
		await interaction.editReply({ content });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(selfurl)
		.setImage(url)
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

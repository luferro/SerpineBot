import type { CommandData, CommandExecute } from '../types/bot';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { StringUtil } from '@luferro/shared-utils';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Memes,
	slashCommand: new SlashCommandBuilder().setName(CommandName.Memes).setDescription('Random meme.'),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const posts = await RedditApi.getPosts('Memes');
	const { title, url, selfurl, hasEmbeddedMedia } = posts[Math.floor(Math.random() * posts.length)];

	if (hasEmbeddedMedia) {
		await interaction.reply({ content: `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}` });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(selfurl)
		.setImage(url)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

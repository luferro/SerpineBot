import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { RedditApi } from '@luferro/reddit-api';
import { StringUtil } from '@luferro/shared-utils';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Memes,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder().setName(CommandName.Memes).setDescription('Random meme.'),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const {
		0: { title, url, selfurl },
	} = await RedditApi.getPosts('Memes');

	const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => url.includes(extension));
	if (hasVideoExtension) {
		const formattedTitle = `[${StringUtil.truncate(title)}](<${selfurl}>)`;
		await interaction.reply({ content: `**${formattedTitle}**\n${url}` });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(selfurl)
		.setImage(url)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Reddit from '../apis/reddit';
import * as StringUtil from '../utils/string';

export const data = {
	name: 'memes',
	client: false,
	slashCommand: new SlashCommandBuilder().setName('memes').setDescription('Returns a random meme.'),
};

export const execute = async (interaction: CommandInteraction) => {
	const {
		0: {
			data: { title, permalink, url },
		},
	} = await Reddit.getPosts('Memes');

	const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => url.includes(extension));
	if (hasVideoExtension)
		return await interaction.reply({
			content: `**[${StringUtil.truncate(title)}](<https://www.reddit.com${permalink}>)**\n${url}`,
		});

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(StringUtil.truncate(title))
				.setURL(`https://www.reddit.com${permalink}`)
				.setImage(url)
				.setColor('RANDOM'),
		],
	});
};

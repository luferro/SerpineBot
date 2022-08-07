import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Reddit from '../apis/reddit';
import { CommandName } from '../types/enums';
import * as StringUtil from '../utils/string';

export const data = {
	name: CommandName.Memes,
	client: false,
	slashCommand: new SlashCommandBuilder().setName(CommandName.Memes).setDescription('Random meme.'),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const {
		0: {
			data: { title, permalink, url },
		},
	} = await Reddit.getPosts('Memes');

	const hasVideoExtension = ['.gif', '.gifv', '.mp4'].some((extension) => url.includes(extension));
	if (hasVideoExtension) {
		const formattedTitle = `[${StringUtil.truncate(title)}](<https://www.reddit.com${permalink}>)`;

		await interaction.reply({ content: `**${formattedTitle}**\n${url}` });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(`https://www.reddit.com${permalink}`)
		.setImage(url)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

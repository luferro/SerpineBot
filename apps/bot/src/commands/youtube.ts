import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { YoutubeApi } from '@luferro/google-api';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Youtube,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Youtube)
		.setDescription('Returns the Youtube URL that matches your search query.')
		.addStringOption((option) => option.setName('query').setDescription('Youtube search query.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const query = interaction.options.getString('query', true);
	const {
		0: { url },
	} = await YoutubeApi.search(query);

	await interaction.reply({ content: url });
};

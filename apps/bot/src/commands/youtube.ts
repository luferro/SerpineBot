import type { CommandData, CommandExecute } from '../types/bot';
import { SlashCommandBuilder } from 'discord.js';
import { YoutubeApi } from '@luferro/google-api';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Youtube,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Youtube)
		.setDescription('Returns the Youtube URL that matches your search query.')
		.addStringOption((option) => option.setName('query').setDescription('Youtube search query.').setRequired(true)),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const query = interaction.options.getString('query', true);

	const {
		0: { url },
	} = await YoutubeApi.search(query);

	await interaction.reply({ content: url });
};

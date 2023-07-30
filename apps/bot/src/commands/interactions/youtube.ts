import { SlashCommandStringOption } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../types/bot';

export const data: InteractionCommandData = [
	new SlashCommandStringOption().setName('query').setDescription('Youtube search query.').setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const results = await client.api.google.youtube.search(query);
	if (results.length === 0) throw new Error(`No results found for "${query}".`);

	await interaction.editReply({ content: results[0].url });
};

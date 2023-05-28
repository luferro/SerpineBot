import { EmbedBuilder } from 'discord.js';

import type { CommandExecute } from '../types/bot';

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const { title, url, image } = await client.api.comics.gocomics.getRandomComic();
	if (!title || !url || !image) throw new Error('No comic was found.');

	const embed = new EmbedBuilder().setTitle(title).setURL(url).setImage(image).setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};

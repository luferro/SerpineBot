import { EmbedBuilder } from 'discord.js';

import type { InteractionCommandExecute } from '../../types/bot';

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const { title, url, image } = await client.api.comics.getRandomComic();
	if (!title || !url || !image) throw new Error('No comic was found.');

	const embed = new EmbedBuilder().setTitle(title).setURL(url).setImage(image).setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};

import { EmbedBuilder, SlashCommandStringOption } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../types/bot';

export const data: InteractionCommandData = [
	new SlashCommandStringOption()
		.setName(t('interactions.comics.options.0.name'))
		.setDescription(t('interactions.comics.options.0.description'))
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.comics.options.0.name'), true);

	const { id } = await client.api.comics.search({ query });
	if (!id) throw new Error(t('errors.search.none'));

	const { title, image, url } = await client.api.comics.getComic({ id });
	if (!title || !image || !url) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder().setTitle(title).setURL(url).setImage(image).setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};

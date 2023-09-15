import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.reviews.name'))
	.setDescription(t('interactions.gaming.reviews.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.gaming.reviews.options.0.name'))
			.setDescription(t('interactions.gaming.reviews.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.gaming.reviews.options.0.name'), true);

	const { id } = await client.api.gaming.reviews.search(query);
	if (!id) throw new Error(t('errors.search.lookup', { query }));

	const review = await client.api.gaming.reviews.getReviewsById(id);
	const { name, url, releaseDate, platforms, tier, score, count, recommended, image } = review;
	if (!tier || !score) throw new Error(t('errors.search.lookup', { query }));

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setThumbnail(tier)
		.setImage(image)
		.addFields([
			{
				name: t('interactions.gaming.reviews.embed.fields.0.name'),
				value: releaseDate ?? t('common.unavailable'),
			},
			{
				name: t('interactions.gaming.reviews.embed.fields.1.name'),
				value: platforms.join('\n') || t('common.unavailable'),
			},
			{
				name: t('interactions.gaming.reviews.embed.fields.2.name'),
				value: score ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.gaming.reviews.embed.fields.3.name'),
				value: count ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.gaming.reviews.embed.fields.4.name'),
				value: recommended ?? t('common.unavailable'),
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('reviews')
	.setDescription('Opencritic reviews for a game.')
	.addStringOption((option) => option.setName('query').setDescription('Game title.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const { id } = await client.api.gaming.reviews.search(query);
	if (!id) throw new Error(`No matches for "${query}".`);

	const review = await client.api.gaming.reviews.getReviewsById(id);
	const { name, url, releaseDate, platforms, tier, score, count, recommended, image } = review;
	if (!tier || !score) throw new Error(`${name} doesn't have enough reviews to be displayed.`);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setThumbnail(tier)
		.setImage(image)
		.addFields([
			{
				name: '**Release date**',
				value: releaseDate ?? 'Soon',
			},
			{
				name: '**Available on**',
				value: platforms.join('\n') || 'N/A',
			},
			{
				name: '**Score**',
				value: score ?? 'N/A',
				inline: true,
			},
			{
				name: '**Reviews count**',
				value: count ?? 'N/A',
				inline: true,
			},
			{
				name: '**Critics Recommended**',
				value: recommended ?? 'N/A',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

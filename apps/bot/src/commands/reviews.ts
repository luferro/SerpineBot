import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { OpenCriticApi } from '@luferro/games-api';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Reviews,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Reviews)
		.setDescription('Reviews for a given game.')
		.addStringOption((option) => option.setName('game').setDescription('Game title.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = interaction.options.getString('game', true);

	const { id } = await OpenCriticApi.search(game);
	if (!id) throw new Error(`No matches for ${game}.`);

	const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
		await OpenCriticApi.getReviewById(id);
	if (!tier && !score) throw new Error(`${name} doesn't have enough reviews to be displayed.`);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setThumbnail(tier)
		.setImage(image)
		.addFields([
			{
				name: '**Release date**',
				value: releaseDate,
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
				value: count?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Critics Recommended**',
				value: recommended ?? 'N/A',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

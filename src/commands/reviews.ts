import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as OpenCritic from '../apis/opencritic';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Reviews,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Reviews)
		.setDescription('Reviews for a given game.')
		.addStringOption((option) => option.setName('game').setDescription('Game title.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = interaction.options.getString('game', true);

	const id = await OpenCritic.search(game);
	if (!id) throw new Error(`No matches for ${game}.`);

	const { name, url, releaseDate, platforms, tier, score, count, recommended, image } =
		await OpenCritic.getReviewById(id);
	if (!tier && !score) throw new Error(`${name} doesn't have enough reviews to be displayed.`);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setThumbnail(image)
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
				name: '**Tier**',
				value: tier?.toString() ?? 'N/A',
			},
			{
				name: '**Score**',
				value: score?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Reviews count**',
				value: count?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Critics Recommended**',
				value: recommended ? `${recommended}%` : 'N/A',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

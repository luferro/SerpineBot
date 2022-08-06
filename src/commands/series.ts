import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as TheMovieDB from '../apis/theMovieDB';
import { CommandName, SubscriptionCategory } from '../types/enums';

export const data = {
	name: CommandName.Series,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Series)
		.setDescription('Overview for a given series.')
		.addStringOption((option) => option.setName('series').setDescription('Series title.').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const series = interaction.options.getString('series', true);

	const id = await TheMovieDB.search(series, SubscriptionCategory.Series);
	if (!id) throw new Error(`No matches for ${series}.`);

	const { name, description, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres } =
		await TheMovieDB.getTvShowById(id);
	const { stream } = await TheMovieDB.getProviders(id, SubscriptionCategory.Series);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(description)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Status**',
				value: status?.toString() ?? 'N/A',
			},
			{
				name: '**First Episode**',
				value: firstEpisode?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Next Episode**',
				value: nextEpisode?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Seasons**',
				value: seasons?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Score**',
				value: score?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Runtime**',
				value: runtime?.toString() ?? 'N/A',
				inline: true,
			},
			{
				name: '**Genres**',
				value: genres.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Stream**',
				value: stream.join('\n') || 'N/A',
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

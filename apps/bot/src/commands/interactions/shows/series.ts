import { DateUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type {
	InteractionCommandAutoComplete,
	InteractionCommandData,
	InteractionCommandExecute,
} from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.shows.series.name'))
	.setDescription(t('interactions.shows.series.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.shows.series.options.0.name'))
			.setDescription(t('interactions.shows.series.options.0.description'))
			.setRequired(true)
			.setAutocomplete(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.shows.series.options.0.name'), true);

	const { name, tagline, overview, url, image, seasons, episodes, score, genres, providers } =
		await client.api.shows.getSeriesById({ id: query });

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(url)
		.setDescription(`${tagline ? `*${tagline}*` : ''}\n${overview ?? ''}`.trim())
		.setThumbnail(image)
		.addFields([
			{
				name: t('interactions.shows.series.embed.fields.0.name'),
				value: seasons?.toString() ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.1.name'),
				value: episodes.total
					? t('interactions.shows.series.embed.fields.1.value', { episodes: episodes.total })
					: t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.2.name'),
				value: episodes.duration ?? t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.3.name'),
				value: episodes.last.date
					? DateUtil.format({ date: new Date(episodes.last.date), format: 'dd/MM/yyyy' })
					: t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.4.name'),
				value: episodes.next.date
					? DateUtil.format({ date: new Date(), format: 'dd/MM/yyyy' })
					: t('common.unavailable'),
				inline: true,
			},
			{
				name: t('interactions.shows.series.embed.fields.5.name'),
				value: score ?? t('common.unavailable'),
			},
			{
				name: t('interactions.shows.series.embed.fields.6.name'),
				value: genres.map((genre) => `\`${genre.name}\``).join() || t('common.unavailable'),
			},
			{
				name: t('interactions.shows.series.embed.fields.7.name'),
				value: providers.stream.map((provider) => `\`${provider}\``).join() || t('common.unavailable'),
			},
		])
		.setFooter({ text: t('interactions.shows.series.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

export const autocomplete: InteractionCommandAutoComplete = async ({ client, interaction }) => {
	const { value: query } = interaction.options.getFocused(true);
	if (query.length < 3) return await interaction.respond([]);

	const results = await client.api.shows.search({ query });
	await interaction.respond(
		results
			.filter(({ type }) => type === 'tv')
			.slice(0, 10)
			.map(({ id, title }) => ({ name: title, value: id.toString() })),
	);
};

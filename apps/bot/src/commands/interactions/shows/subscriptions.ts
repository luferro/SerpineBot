import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.shows.subscriptions.name'))
	.setDescription(t('interactions.shows.subscriptions.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.shows.subscriptions.options.0.name'))
			.setDescription(t('interactions.shows.subscriptions.options.0.description'))
			.setRequired(true)
			.addChoices(
				{ name: t('shows.subscriptions.options.0.choices.0.name'), value: 'tv' },
				{ name: t('shows.subscriptions.options.0.choices.1.name'), value: 'movie' },
			),
	)
	.addStringOption((option) =>
		option
			.setName(t('interactions.shows.subscriptions.options.1.name'))
			.setDescription(t('interactions.shows.subscriptions.options.1.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const category = interaction.options.getString(t('interactions.shows.subscriptions.options.0.name'), true) as
		| 'tv'
		| 'movie';
	const query = interaction.options.getString(t('interactions.shows.subscriptions.options.1.name'), true);

	const subscriptions = await client.api.shows.getCatalogMatches(category, query);
	if (subscriptions.length === 0) throw new Error(t('errors.search.lookup', { query }));

	const formattedSubscriptions = subscriptions.map(({ provider, entry }) =>
		entry.url ? `**[${provider}](${entry.url})**` : `**${provider}**`,
	);

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(subscriptions[0].entry.name))
		.addFields([
			{
				name: t('shows.subscriptions.embed.title', { size: `**${subscriptions.length}**` }),
				value: formattedSubscriptions.join('\n'),
			},
		])
		.setFooter({ text: t('shows.subscriptions.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

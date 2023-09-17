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
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.shows.subscriptions.options.0.name'), true);

	const subscriptions = await client.api.shows.getStreamingServices({ query });
	if (subscriptions.length === 0) throw new Error(t('errors.search.lookup', { query }));

	const formattedSubscriptions = subscriptions.map(({ provider, entry }) =>
		entry.url ? `**[${provider}](${entry.url})**` : `**${provider}**`,
	);

	const embed = new EmbedBuilder()
		.setTitle(
			t('interactions.shows.subscriptions.embed.title', {
				item: StringUtil.truncate(subscriptions[0].entry.name),
				size: subscriptions.length,
			}),
		)
		.setDescription(formattedSubscriptions.join('\n'))
		.setFooter({ text: t('interactions.shows.subscriptions.embed.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

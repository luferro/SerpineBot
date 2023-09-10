import { SubscriptionsModel } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.subscriptions.name'))
	.setDescription(t('interactions.gaming.subscriptions.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.gaming.subscriptions.options.0.name'))
			.setDescription(t('interactions.gaming.subscriptions.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString(t('interactions.gaming.subscriptions.options.0.name'), true);

	const subscriptions = await SubscriptionsModel.getMatches({ name: query });
	if (subscriptions.length === 0) throw new Error(t('errors.search.lookup', { query }));

	const formattedSubscriptions = subscriptions.map(({ provider, entry }) =>
		entry.url ? `**[${provider}](${entry.url})**` : `**${provider}**`,
	);

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(subscriptions[0].entry.name))
		.addFields([
			{
				name: t('interactions.gaming.subscriptions.embed.fields.0.name', {
					size: `**${subscriptions.length}**`,
				}),
				value: formattedSubscriptions.join('\n'),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

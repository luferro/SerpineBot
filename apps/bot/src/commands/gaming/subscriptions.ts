import { SubscriptionsModel } from '@luferro/database';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('subscriptions')
	.setDescription('Checks in which subscriptions a game is available.')
	.addStringOption((option) => option.setName('query').setDescription('Game title').setRequired(true));

export const execute: CommandExecute = async ({ interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const subscriptions = await SubscriptionsModel.getCatalogMatches(query);
	if (subscriptions.length === 0) throw new Error(`No subscription service including "${query}" was found.`);

	const formattedSubscriptions = subscriptions.map(({ provider, entry }) =>
		entry.url ? `**[${provider}](${entry.url})**` : `**${provider}**`,
	);

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(subscriptions[0].entry.name))
		.addFields([
			{
				name: `Available in **${subscriptions.length}** subscription(s)`,
				value: formattedSubscriptions.join('\n'),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

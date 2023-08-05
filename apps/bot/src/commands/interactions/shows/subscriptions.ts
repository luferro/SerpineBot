import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('subscriptions')
	.setDescription('Checks in which subscriptions a movie / tv is available.')
	.addStringOption((option) =>
		option
			.setName('category')
			.setDescription('Shows category.')
			.setRequired(true)
			.addChoices({ name: 'Series', value: 'tv' }, { name: 'Movies', value: 'movie' }),
	)
	.addStringOption((option) => option.setName('query').setDescription('Movie / Series title').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const category = interaction.options.getString('category', true) as 'tv' | 'movie';
	const query = interaction.options.getString('query', true);

	const subscriptions = await client.api.shows.getCatalogMatches(category, query);
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
		.setFooter({ text: 'Data provided by JustWatch.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

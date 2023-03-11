import { StringUtil } from '@luferro/shared-utils';
import type { TheMovieDbCategory } from '@luferro/the-movie-db-api';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import * as Subscriptions from '../services/subscriptions';
import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Subscriptions,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Subscriptions)
		.setDescription('Subscription services related commands.')
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Subscription service category.')
				.setRequired(true)
				.addChoices(
					{ name: 'Gaming', value: 'Games' },
					{ name: 'Series', value: 'Series' },
					{ name: 'Movies', value: 'Movies' },
				),
		)
		.addStringOption((option) => option.setName('item').setDescription('Item title').setRequired(true)),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const category = interaction.options.getString('category', true) as TheMovieDbCategory | 'Games';
	const item = interaction.options.getString('item', true);

	const subscriptions =
		category === 'Games'
			? await Subscriptions.getGamingSubscriptions(item)
			: await Subscriptions.getStreamingSubscriptions(item, category);
	if (subscriptions.length === 0) throw new Error(`No subscription service includes ${item}.`);

	const formattedSubscriptions = subscriptions.map(({ name, entry }) =>
		entry.url ? `**[${name}](${entry.url})**` : `**${name}**`,
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

	await interaction.reply({ embeds: [embed] });
};

import type { CommandData, CommandExecute } from '../types/bot';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DealsApi } from '@luferro/games-api';
import * as Subscriptions from '../services/subscriptions';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Deals,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Deals)
		.setDescription('Best PC deals in official stores and keyshops for a given game.')
		.addStringOption((option) => option.setName('game').setDescription('Game title').setRequired(true)),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const game = interaction.options.getString('game', true);

	const { id } = await DealsApi.search(game);
	if (!id) throw new Error(`No matches for ${game}.`);

	const { name, image, historicalLows, officialStores, keyshops, coupons } = await DealsApi.getDealById(id);
	const subscriptions = await Subscriptions.getGamingSubscriptions(name);
	const formattedSubscriptions = subscriptions.map(({ name }) => `**${name}**`).join('\n');

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(`https://gg.deals/eu/game/${id}`)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Historical Low Prices**',
				value: historicalLows.join('\n') || 'N/A',
			},
			{
				name: '**Official Stores**',
				value: officialStores.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Keyshops**',
				value: keyshops.join('\n') || 'N/A',
				inline: true,
			},
			{
				name: '**Coupons**',
				value: coupons.join('\n') || 'N/A',
			},
			{
				name: '**Subscriptions**',
				value: formattedSubscriptions || 'N/A',
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

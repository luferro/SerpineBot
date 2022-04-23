import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as GGDeals from '../apis/ggDeals';
import * as Subscriptions from '../services/subscriptions';

export const data = {
	name: 'deals',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('deals')
		.setDescription('Returns the best deals (official stores and keyshops) for a given PC game.')
		.addStringOption((option) => option.setName('game').setDescription('Game title').setRequired(true)),
};

export const execute = async (interaction: CommandInteraction) => {
	const game = interaction.options.getString('game')!;

	const id = await GGDeals.search(game);
	if (!id) return await interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

	const { name, image, historicalLows, officialStores, keyshops, coupons } = await GGDeals.getDealById(id);

	const subscriptions = await Subscriptions.getGamingSubscriptions(name);
	const formattedSubscriptions = subscriptions.map((item) => `**${item.name}**`);

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(name)
				.setURL(`https://gg.deals/eu/game/${id}`)
				.setThumbnail(image ?? '')
				.addField('Historical Low Prices', historicalLows.length > 0 ? historicalLows.join('\n') : 'N/A')
				.addField('Official Stores', officialStores.length > 0 ? officialStores.join('\n') : 'N/A', true)
				.addField('Keyshops', keyshops.length > 0 ? keyshops.join('\n') : 'N/A', true)
				.addField('Coupons', coupons.length > 0 ? coupons.join('\n') : 'N/A')
				.addField(
					'Subscriptions',
					formattedSubscriptions.length > 0 ? formattedSubscriptions.join('\n') : 'N/A',
				)
				.setColor('RANDOM'),
		],
	});
};

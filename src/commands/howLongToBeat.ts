import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as HowLongToBeat from '../apis/howLongToBeat';

export const data = {
	name: 'hltb',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('hltb')
		.setDescription('Returns an average playtime needed to beat a given game.')
		.addStringOption((option) => option.setName('game').setDescription('Game title.').setRequired(true)),
};

export const execute = async (interaction: CommandInteraction) => {
	const game = interaction.options.getString('game')!;

	const id = await HowLongToBeat.search(game);
	if (!id) return await interaction.reply({ content: `Couldn't find a match for ${game}.`, ephemeral: true });

	const {
		name,
		image,
		playtimes: { main, mainExtra, completionist },
	} = await HowLongToBeat.getGameById(id);

	const hasPlaytimes = main || mainExtra || completionist;
	if (!hasPlaytimes)
		return await interaction.reply({ content: `No playtimes were found for ${name}.`, ephemeral: true });

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(`How long to beat \`${name}\``)
				.setThumbnail(image ?? '')
				.addField('**Main Story**', main ? `~${main}` : 'N/A', true)
				.addField('**Main Story + Extras**', mainExtra ? `~${mainExtra}` : 'N/A', true)
				.addField('**Completionist**', completionist ? `~${completionist}` : 'N/A', true)
				.setColor('RANDOM'),
		],
	});
};

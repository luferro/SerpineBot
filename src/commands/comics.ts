import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as GoComics from '../apis/goComics';
import { ComicSelection, CommandName } from '../types/enums';

export const data = {
	name: CommandName.Comics,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Comics)
		.setDescription('Random comic page from the available options.')
		.addIntegerOption((option) =>
			option
				.setName('selection')
				.setDescription('Comic selection.')
				.setRequired(true)
				.addChoices(
					{ name: 'Garfield', value: ComicSelection.Garfield },
					{ name: 'Peanuts', value: ComicSelection.Peanuts },
					{ name: 'Get Fuzzy', value: ComicSelection.GetFuzzy },
					{ name: 'Fowl Language', value: ComicSelection.FowlLanguage },
					{ name: 'Calvin and Hobbes', value: ComicSelection.CalvinAndHobbes },
					{ name: 'Jake Likes Onions', value: ComicSelection.JakeLikesOnions },
					{ name: "Sarah's Scribbles", value: ComicSelection.SarahsScribbles },
					{ name: 'Worry Lines', value: ComicSelection.WorryLines },
				),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const selection = interaction.options.getInteger('category', true) as ComicSelection;

	const { title, url, image } = await GoComics.getComics(selection);
	if (!title || !url || !image) throw new Error('No comic was found.');

	const embed = new EmbedBuilder().setTitle(title).setURL(url).setImage(image).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

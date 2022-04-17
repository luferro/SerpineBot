import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as GoComics from '../apis/goComics';
import { ComicCategories } from '../types/categories';

export const data = {
    name: 'comics',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('comics')
        .setDescription('Returns a random comic.')
        .addStringOption(option => option.setName('category').setDescription('Comic category.').setRequired(true)
            .addChoices(
                { name: 'Garfield', value: 'garfield' },
                { name: 'Peanuts', value: 'peanuts' },
                { name: 'Get Fuzzy', value: 'get fuzzy' },
                { name: 'Fowl Language', value: 'fowl language' },
                { name: 'Calvin and Hobbes', value: 'calvin and hobbes' },
                { name: 'Jake Likes Onions', value: 'jake likes onions' },
                { name: 'Sarah\'s Scribbles', value: 'sarahs scribbles' },
                { name: 'Worry Lines', value: 'worry lines' }
            )
        )
}

export const execute = async (interaction: CommandInteraction) => {
    const choice = interaction.options.getString('category')! as ComicCategories;

    const { title, url, image } = await GoComics.getComics(choice);
    if(!title || !url || !image) return await interaction.reply({ content: 'Couldn\'t find the requested comic.', ephemeral: true });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(url)
            .setImage(image)
            .setColor('RANDOM')
    ]});
}
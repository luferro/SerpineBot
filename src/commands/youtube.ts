import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import * as Youtube from '../apis/youtube';

export const data = {
    name: 'youtube',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Returns the Youtube URL that matches your search query.')
        .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const query = interaction.options.getString('query')!;
    const results = await Youtube.search(query);

    await interaction.reply({ content: results[0].url });
}
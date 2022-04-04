import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as OpenCritic from '../apis/opencritic';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'reviews',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('reviews')
        .setDescription('Returns reviews for a game.')
        .addStringOption(option => option.setName('game').setDescription('Game title.').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const game = interaction.options.getString('game')!;

    const id = await OpenCritic.search(game);
    if(!id) throw new InteractionError(`Couldn't find a match for ${game}.`);

    const { name, url, releaseDate, platforms, tier, score, count, recommended, image } = await OpenCritic.getReviewById(id);
    if(!tier && !score) throw new InteractionError(`${name} currently doesn\'t have enough reviews to be displayed.`);

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(url)
            .setThumbnail(image ?? '')
            .addField('**Release date**', releaseDate)
            .addField('**Available on**', platforms.length > 0 ? platforms.join('\n') : 'N/A')
            .addField('**Tier**', tier?.toString() ?? 'N/A')
            .addField('**Score**', score?.toString() ?? 'N/A', true)
            .addField('**Reviews count**', count?.toString() ?? 'N/A', true)
            .addField('**Critics Recommended**', recommended?.toString() ?? 'N/A', true)
            .setColor('RANDOM')
    ]});
}
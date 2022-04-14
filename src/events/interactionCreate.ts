import { CommandInteraction } from 'discord.js'
import { Bot } from '../bot'
import { logger } from '../utils/logger';

export const data = {
    name: 'interactionCreate',
    once: false
}

export const execute = async (client: Bot, interaction: CommandInteraction) => {
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    logger.info(`User \`${interaction.user.tag}\` used interaction \`${`/${interaction.commandName} ${interaction.options.getSubcommand(false) ?? ''}`.trim()}\`.`);

    if(command.data.client) return await command.execute(client, interaction);
    await command.execute(interaction);
}
import { CommandInteraction } from 'discord.js'
import { Bot } from '../bot'
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'interactionCreate',
    once: false
}

export const execute = async (client: Bot, interaction: CommandInteraction) => {
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        if(command.data.client) return await command.execute(client, interaction);
        await command.execute(interaction);   
    } catch (error) {
        const isInteractionError = error instanceof InteractionError;
        if(!isInteractionError) throw error;

        if(interaction.isSelectMenu() || interaction.isButton()) {
            await interaction.editReply({ content: error.message, embeds: [], components: [] });
            return;
        }
        
        await interaction.reply({ content: error.message, ephemeral: true });        
    }
}
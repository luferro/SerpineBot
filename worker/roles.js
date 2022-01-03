import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import settingsSchema from '../models/settingsSchema.js';

const COMPONENTS_LIMIT = 5;

const createRolesMessage = async (client, itemsPerRow = 5) => {
    for(const [guildID, guild] of client.guilds.cache) {
        const settings = await settingsSchema.find({ guild: guildID });
        const channelID = settings[0]?.roles?.channel;
        if(!channelID) continue;

        const roles = settings[0]?.roles?.options.map(item => {
            const messageRole = guild.roles.cache.find(nestedItem => nestedItem.id === item);
            if(!messageRole) return;

            return messageRole.name;
        }).filter(Boolean);

        const components = [];
        const rows = Math.ceil(roles.length / itemsPerRow);
        for(let index = 0; index < rows; index++) {
            const row = new MessageActionRow();
    
            for(const role of roles.slice(0, itemsPerRow)) {
                const button = new MessageButton()
                    .setCustomId(role)
                    .setLabel(role)
                    .setStyle(role === 'NSFW' ? 'DANGER' : 'PRIMARY');
                
                row.addComponents(button);
            }
            roles.splice(0, itemsPerRow);
            components.push(row);
        }
        if(components.length > COMPONENTS_LIMIT) continue;
    
        const message = new MessageEmbed()
            .setTitle('Text channel roles')
            .setDescription('Use the buttons below to claim or revoke a role.\nEach role grants access to a different text channel.')
            .setColor('RANDOM');
    
        const channel = await client.channels.fetch(channelID);
        const messages = await channel.messages.fetch();

        const rolesMessage = messages.find(item => item?.embeds[0]?.title === 'Text channel roles');
        if(!rolesMessage) channel.send({ embeds: [message], components });
        else rolesMessage.edit({ embeds: [message], components });

        handleCollector(channel);
    }
}

const handleCollector = channel => {
    const collector = channel.createMessageComponentCollector({ componentType: 'BUTTON', max: 1 });
    collector.on('end', async collected => {
        const collectedInteraction = collected.first();
		if(!collectedInteraction) return;

        await assignRole(collectedInteraction);
        handleCollector(channel);
    });
}

const assignRole = interaction => {
    const role = interaction.member.guild.roles.cache.find(role => role.name === interaction.customId);
    const restrictionsRole = interaction.member.guild.roles.cache.find(role => role.name === 'Restrictions');

    const hasRestrictionsRole = interaction.member.roles.cache.has(restrictionsRole.id);
    if((hasRestrictionsRole && role.name === 'NSFW') || interaction.member.user.bot) return interaction.reply({ content: 'Users with role `Restrictions` can\'t be granted the NSFW role.', ephemeral: true });

    const hasRole = interaction.member.roles.cache.has(role.id);
    if(!hasRole) interaction.member.roles.add(role);
    else interaction.member.roles.remove(role);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Role ${role.name} has been ${hasRole ? 'revoked' : 'granted'}!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

export default { createRolesMessage };
import { ButtonInteraction, Client, GuildMember, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../bot';
import { settingsModel } from '../database/models/settings';
import { JobError } from '../errors/jobError';

const COMPONENTS_LIMIT = 5;
const ITEMS_PER_ROW = 5;

export const data = {
    name: 'roles',
    schedule: new Date(Date.now() + 1000 * 60)
}

export const execute = async (client: Bot | Client) => {
    const errors: string[] = [];

    for(const [guildId, guild] of client.guilds.cache) {
        const settings = await settingsModel.findOne({ guildId });

        const channelId = settings?.roles.channelId;
        if(!channelId) continue;

        const roles = settings.roles.options.map(item => {
            const messageRole = guild.roles.cache.find(nestedItem => nestedItem.id === item);
            if(!messageRole) return;

            return messageRole.name;
        }).filter((item): item is NonNullable<typeof item> => !!item);

        const components = [];
        const rows = Math.ceil(roles.length / ITEMS_PER_ROW);
        for(let index = 0; index < rows; index++) {
            const row = new MessageActionRow();

            for(const role of roles.slice(0, ITEMS_PER_ROW)) {
                const button = new MessageButton()
                    .setCustomId(role)
                    .setLabel(role)
                    .setStyle(role === 'NSFW' ? 'DANGER' : 'PRIMARY');
                
                row.addComponents(button);
            }
            roles.splice(0, ITEMS_PER_ROW);
            components.push(row);
        }
        if(components.length > COMPONENTS_LIMIT) continue;

        const message = new MessageEmbed()
            .setTitle('Text channel roles')
            .setDescription('Use the buttons below to claim or revoke a role.\nEach role grants access to a different text channel.')
            .setColor('RANDOM');

        const channel = await client.channels.fetch(channelId) as TextChannel;
        if(!channel) continue;

        const messages = await channel.messages.fetch();

        const rolesMessage = messages.find(item => item?.embeds[0]?.title === 'Text channel roles');
        if(!rolesMessage) await channel.send({ embeds: [message], components });
        else await rolesMessage.edit({ embeds: [message], components });
        
        await handleCollector(channel).catch(error => { errors.push(error.message); });
    }

    if(errors.length > 0) throw new JobError(`Roles:\n${errors.join('\n')}`);
}

const handleCollector = async (channel: TextChannel) => {
    const collector = channel.createMessageComponentCollector({ componentType: 'BUTTON', max: 1 });
    await new Promise<void>((resolve, reject) => {
        collector.on('end', async (collected) => {
            try {
                const collectedInteraction = collected.first();
                if(!collectedInteraction) return;
        
                await assignRole(collectedInteraction);
                await handleCollector(channel);
            } catch (error) {
                reject(error);
            }
        });
    })
}

const assignRole = async (interaction: ButtonInteraction) => {
    const member = interaction.member as GuildMember;
    if(member.user.bot) return;

    const role = member.guild.roles.cache.find(role => role.name === interaction.customId)!;
    const restrictionsRole = member.guild.roles.cache.find(role => role.name === 'Restrictions');

    if(restrictionsRole) {
        const hasRestrictionsRole = member.roles.cache.has(restrictionsRole.id);
        if(hasRestrictionsRole && role.name === 'NSFW') throw new Error('Users with role `Restrictions` can\'t be granted the NSFW role.');
    }

    const hasRole = member.roles.cache.has(role.id);
    if(!hasRole) member.roles.add(role);
    else member.roles.remove(role);

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Role ${role.name} has been ${hasRole ? 'revoked' : 'granted'}!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}
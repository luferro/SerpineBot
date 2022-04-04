import { GuildMember } from 'discord.js'
import { Bot } from '../bot'
import * as Roles from '../services/roles';

export const data = {
    name: 'guildMemberAdd',
    once: false
}

export const execute = async (client: Bot, member: GuildMember) => {
    let role = member.guild.roles.cache.find(role => role.name === 'Restrictions');
    if(!role) role = await Roles.create(member.guild, 'Restrictions', 'DEFAULT', false, false);
	
    await member.roles.add(role);
}
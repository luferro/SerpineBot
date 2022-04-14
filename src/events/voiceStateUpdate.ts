import { VoiceState } from 'discord.js';
import { Bot } from '../bot';

export const data = {
    name: 'voiceStateUpdate',
    once: false
}

export const execute = async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
    const isSelf = oldState.guild.me?.user.id === oldState.member?.user.id;
    const isStillInVoiceChannel = newState.channel?.isVoice();
    if(isSelf && !isStillInVoiceChannel) client.music.delete(newState.guild.id);
}
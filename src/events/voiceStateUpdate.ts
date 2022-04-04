import { VoiceState } from 'discord.js';
import { Bot } from '../bot';

export const data = {
    name: 'voiceStateUpdate',
    once: false
}

export const execute = async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
    const newChannel = newState.channel?.isVoice();
    if(!newChannel) client.music.delete(newState.guild.id);
}
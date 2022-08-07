import { VoiceState } from 'discord.js';
import { Bot } from '../bot';
import { EventName } from '../types/enums';

export const data = {
	name: EventName.VoiceStateUpdate,
	once: false,
};

export const execute = async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
	const isSelf = oldState.guild.members.me?.user.id === oldState.member?.user.id;
	const isStillInVoiceChannel = newState.channel?.isVoiceBased();
	if (isSelf && !isStillInVoiceChannel) Bot.music.delete(newState.guild.id);
};

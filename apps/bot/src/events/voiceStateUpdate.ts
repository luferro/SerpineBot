import type { VoiceState } from 'discord.js';
import { Bot } from '../structures/bot';
import { EventName } from '../types/enums';

export const data = {
	name: EventName.VoiceStateUpdate,
	type: 'on',
};

export const execute = async (_client: Bot, oldState: VoiceState, newState: VoiceState) => {
	const isSelf = oldState.guild.members.me?.user.id === oldState.member?.user.id;
	const isStillInVoiceChannel = newState.channel?.isVoiceBased();
	if (isSelf && !isStillInVoiceChannel) Bot.music.delete(newState.guild.id);
};

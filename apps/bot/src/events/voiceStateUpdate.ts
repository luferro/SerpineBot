import type { EventData } from '../types/bot';
import type { Client, VoiceState } from 'discord.js';
import { Bot } from '../structures/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.VoiceStateUpdate,
	type: 'on',
};

export const execute = async (_client: Client, oldState: VoiceState, newState: VoiceState) => {
	const isSelf = oldState.guild.members.me?.user.id === oldState.member?.user.id;
	const isStillInVoiceChannel = newState.channel?.isVoiceBased();
	if (isSelf && !isStillInVoiceChannel) Bot.music.delete(newState.guild.id);
};

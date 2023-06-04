import type { VoiceState } from 'discord.js';

import type { Bot } from '../structures/Bot';
import type { EventData } from '../types/bot';

export const data: EventData = { type: 'on' };

export const execute = async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
	const isSelf = oldState.guild.members.me?.user.id === oldState.member?.user.id;
	const isStillInVoiceChannel = newState.channel?.isVoiceBased();
	if (isSelf && !isStillInVoiceChannel) client.player.queues.get(newState.guild.id)?.delete();
};

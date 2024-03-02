import type { VoiceState } from "discord.js";
import type { EventData, EventExecute } from "../types/bot";

type Args = [oldState: VoiceState, newState: VoiceState];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [oldState, newState] }) => {
	const isSelf = oldState.guild.members.me?.user.id === oldState.member?.user.id;
	const isStillInVoiceChannel = newState.channel?.isVoiceBased();
	if (isSelf && !isStillInVoiceChannel) client.player.queues.get(newState.guild.id)?.delete();
};

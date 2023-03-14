import { SettingsModel } from '@luferro/database';
import { MessageEnum } from '@luferro/database';
import type { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { ChannelType } from 'discord.js';

export const createChannel = async (guild: Guild, name: string, type: ChannelType, topic: string, nsfw: boolean) => {
	if (type !== ChannelType.GuildText && type !== ChannelType.GuildVoice) throw new Error('Invalid channel type.');
	await guild.channels.create({ name, type, nsfw, topic });
};

export const deleteChannel = async (channel: TextChannel | VoiceChannel) => {
	await channel.delete();
};

export const updateChannel = async (
	channel: TextChannel | VoiceChannel,
	name?: string,
	topic?: string,
	nsfw?: boolean,
) => {
	const oldTopic = channel.type === ChannelType.GuildText ? channel.topic : null;
	const oldNsfw = channel.type === ChannelType.GuildText ? channel.nsfw : false;

	await channel.edit({
		name: name ?? channel.name,
		topic: topic ?? oldTopic,
		nsfw: nsfw ?? oldNsfw,
	});
};

export const assignChannel = async (
	guildId: string,
	category: MessageEnum,
	channel: TextChannel,
	options?: string[],
) => {
	const channelId = channel.id;
	await SettingsModel.createGuildMessage(guildId, { category, channelId, options });
};

export const unassignChannel = async (guildId: string, category: MessageEnum, channel: TextChannel) => {
	const message = await SettingsModel.getGuildMessage(guildId, category);
	if (message?.channelId !== channel.id) {
		throw new Error(`${MessageEnum[category]} message is not assigned to channel ${channel.name}.`);
	}

	await SettingsModel.deleteGuildMessage(guildId, category);
};

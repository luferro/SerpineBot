import { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { settingsModel } from '../database/models/settings';
import { ChannelCategories, MessageCategories } from '../types/categories';

export const create = async (guild: Guild, name: string, type: ChannelCategories, topic: string, nsfw: boolean) => {
	await guild.channels.create(name, {
		type,
		nsfw,
		topic,
	});
};

export const update = async (
	channel: TextChannel | VoiceChannel,
	name: string | null,
	topic: string | null,
	nsfw: boolean | null,
) => {
	const oldTopic = channel instanceof TextChannel ? channel.topic ?? '' : undefined;
	const oldNsfw = channel instanceof TextChannel ? channel.nsfw : undefined;

	await channel.edit({
		name: name ?? channel.name,
		topic: topic ?? oldTopic,
		nsfw: nsfw ?? oldNsfw,
	});
};

export const remove = async (channel: TextChannel | VoiceChannel) => {
	await channel.delete();
};

export const assign = async (guildId: string, channel: TextChannel, category: MessageCategories, values: string[]) => {
	const $set = {
		...(category === 'ROLES_MESSAGE' && { 'roles.channelId': channel.id, 'roles.options': values }),
		...(category === 'BIRTHDAYS_MESSAGE' && { 'birthdays.channelId': channel.id }),
		...(category === 'LEADERBOARDS_MESSAGE' &&
			values.includes('Steam') && { 'leaderboards.steam.channelId': channel.id }),
	};

	await settingsModel.updateOne({ guildId }, { $set });
};

export const dissociate = async (
	guildId: string,
	channel: TextChannel,
	category: MessageCategories,
	values: string[],
) => {
	const settings = await settingsModel.findOne({ guildId });

	const isValid =
		(category === 'ROLES_MESSAGE' && settings?.roles.channelId === channel.id) ||
		(category === 'BIRTHDAYS_MESSAGE' && settings?.birthdays.channelId === channel.id) ||
		(category === 'LEADERBOARDS_MESSAGE' &&
			values.includes('Steam') &&
			settings?.leaderboards.steam.channelId === channel.id);
	if (!isValid) throw new Error(`Channel ${channel.name} doesn't have a ${category} assigned.`);

	const $set = {
		...(category === 'ROLES_MESSAGE' && { 'roles.channelId': null, 'roles.options': [] }),
		...(category === 'BIRTHDAYS_MESSAGE' && { 'birthdays.channelId': null }),
		...(category === 'LEADERBOARDS_MESSAGE' &&
			values.includes('Steam') && { 'leaderboards.steam.channelId': null }),
	};

	await settingsModel.updateOne({ guildId }, { $set });
};

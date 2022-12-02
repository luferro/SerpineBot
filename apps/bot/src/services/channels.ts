import type { Guild, TextChannel, VoiceChannel } from 'discord.js';
import type { MessageCategory } from '../types/category';
import { ChannelType } from 'discord.js';
import { settingsModel } from '../database/models/settings';

export const create = async (guild: Guild, name: string, type: ChannelType, topic: string, nsfw: boolean) => {
	if (type !== ChannelType.GuildText && type !== ChannelType.GuildVoice) throw new Error('Invalid channel type.');

	await guild.channels.create({ name, type, nsfw, topic });
};

export const remove = async (channel: TextChannel | VoiceChannel) => {
	await channel.delete();
};

export const update = async (channel: TextChannel | VoiceChannel, name?: string, topic?: string, nsfw?: boolean) => {
	const oldTopic = channel.type === ChannelType.GuildText ? channel.topic : null;
	const oldNsfw = channel.type === ChannelType.GuildText ? channel.nsfw : false;

	await channel.edit({
		name: name ?? channel.name,
		topic: topic ?? oldTopic,
		nsfw: nsfw ?? oldNsfw,
	});
};

export const assign = async (guildId: string, channel: TextChannel, category: MessageCategory, values: string[]) => {
	const select: Record<typeof category, () => Promise<void>> = {
		Roles: () => assignRolesMessage(guildId, channel, values),
		Birthdays: () => assignBirthdaysMessage(guildId, channel),
		Leaderboards: () => assignLeaderboardsMessage(guildId, channel, values),
	};
	await select[category]();
};

const assignRolesMessage = async (guildId: string, channel: TextChannel, values: string[]) => {
	await settingsModel.updateOne({ guildId }, { $set: { 'roles.channelId': channel.id, 'roles.options': values } });
};

const assignBirthdaysMessage = async (guildId: string, channel: TextChannel) => {
	await settingsModel.updateOne({ guildId }, { $set: { 'birthdays.channelId': channel.id } });
};

const assignLeaderboardsMessage = async (guildId: string, channel: TextChannel, values: string[]) => {
	const isSteamLeaderboard = values.includes('Steam');
	const isXboxLeaderboard = values.includes('Xbox');

	if (isSteamLeaderboard && isXboxLeaderboard) {
		await settingsModel.updateOne(
			{ guildId },
			{ $set: { 'leaderboards.steam.channelId': channel.id, 'leaderboards.xbox.channelId': channel.id } },
		);
		return;
	}

	if (isSteamLeaderboard) {
		await settingsModel.updateOne({ guildId }, { $set: { 'leaderboards.steam.channelId': channel.id } });
		return;
	}

	await settingsModel.updateOne({ guildId }, { $set: { 'leaderboards.xbox.channelId': channel.id } });
};

export const dissociate = async (
	guildId: string,
	channel: TextChannel,
	category: MessageCategory,
	values: string[],
) => {
	const select: Record<typeof category, () => Promise<void>> = {
		Roles: () => dissociateRolesMessage(guildId, channel),
		Birthdays: () => dissociateBirthdaysMessage(guildId, channel),
		Leaderboards: () => dissociateLeaderboardsMessage(guildId, channel, values),
	};
	await select[category]();
};

const dissociateRolesMessage = async (guildId: string, channel: TextChannel) => {
	const settings = await settingsModel.findOne({ guildId });
	if (settings?.roles.channelId !== channel.id)
		throw new Error(`Roles message is not assigned to channel ${channel.name}.`);

	await settingsModel.updateOne({ guildId }, { $set: { 'roles.channelId': null, 'roles.options': [] } });
};

const dissociateBirthdaysMessage = async (guildId: string, channel: TextChannel) => {
	const settings = await settingsModel.findOne({ guildId });
	if (settings?.birthdays.channelId !== channel.id)
		throw new Error(`Roles message is not assigned to channel ${channel.name}.`);

	await settingsModel.updateOne({ guildId }, { $set: { 'birthdays.channelId': null } });
};

const dissociateLeaderboardsMessage = async (guildId: string, channel: TextChannel, values: string[]) => {
	const settings = await settingsModel.findOne({ guildId });

	const isSteamLeaderboard = values.includes('Steam');
	const isXboxLeaderboard = values.includes('Xbox');

	if (isSteamLeaderboard && isXboxLeaderboard) {
		if (
			settings?.leaderboards.steam.channelId !== channel.id ||
			settings?.leaderboards.xbox.channelId !== channel.id
		)
			throw new Error(`Leaderboard message for either Steam or Xbox is not assigned to channel ${channel.name}.`);

		await settingsModel.updateOne(
			{ guildId },
			{ $set: { 'leaderboards.steam.channelId': null, 'leaderboards.xbox.channelId': null } },
		);
		return;
	}

	if (isSteamLeaderboard) {
		if (settings?.leaderboards.steam.channelId !== channel.id)
			throw new Error(`Leaderboards message for Steam is not assigned to channel ${channel.name}`);

		await settingsModel.updateOne({ guildId }, { $set: { 'leaderboards.steam.channelId': null } });
		return;
	}

	if (settings?.leaderboards.xbox.channelId !== channel.id)
		throw new Error(`Leaderboards message for Xbox is not assigned to channel ${channel.name}`);

	await settingsModel.updateOne({ guildId }, { $set: { 'leaderboards.xbox.channelId': null } });
};

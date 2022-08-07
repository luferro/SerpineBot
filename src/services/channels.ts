import { ChannelType, Guild, TextChannel, VoiceChannel } from 'discord.js';
import { settingsModel } from '../database/models/settings';
import { IntegrationCategory, MessageCategory } from '../types/enums';

export const create = async (guild: Guild, name: string, type: ChannelType, topic: string, nsfw: boolean) => {
	if (type !== ChannelType.GuildText && type !== ChannelType.GuildVoice) throw new Error('Invalid channel type.');

	await guild.channels.create({
		name,
		type,
		nsfw,
		topic,
	});
};

export const update = async (channel: TextChannel | VoiceChannel, name?: string, topic?: string, nsfw?: boolean) => {
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

export const assign = async (guildId: string, channel: TextChannel, category: MessageCategory, values: string[]) => {
	const options = {
		[MessageCategory.Roles]: () => ({ $set: { 'roles.channelId': channel.id, 'roles.options': values } }),
		[MessageCategory.Birthdays]: () => ({ $set: { 'birthdays.channelId': channel.id } }),
		[MessageCategory.Leaderboards]: () => {
			const steamIntegration = IntegrationCategory[IntegrationCategory.Steam];
			const xboxIntegration = IntegrationCategory[IntegrationCategory.Xbox];

			if (values.includes(steamIntegration) && values.includes(xboxIntegration))
				return {
					$set: { 'leaderboards.steam.channelId': channel.id, 'leaderboards.xbox.channelId': channel.id },
				};

			if (values.includes(steamIntegration)) return { $set: { 'leaderboards.steam.channelId': channel.id } };
			return { $set: { 'leaderboards.xbox.channelId': channel.id } };
		},
	};
	const { $set } = options[category]();

	await settingsModel.updateOne({ guildId }, { $set });
};

export const dissociate = async (
	guildId: string,
	channel: TextChannel,
	category: MessageCategory,
	values: string[],
) => {
	const settings = await settingsModel.findOne({ guildId });

	const options = {
		[MessageCategory.Roles]: () => ({
			isValid: settings?.roles.channelId === channel.id,
			$set: { 'roles.channelId': null, 'roles.options': [] },
		}),
		[MessageCategory.Birthdays]: () => ({
			isValid: settings?.birthdays.channelId === channel.id,
			$set: { 'birthdays.channelId': null },
		}),
		[MessageCategory.Leaderboards]: () => {
			const steamIntegration = IntegrationCategory[IntegrationCategory.Steam];
			const xboxIntegration = IntegrationCategory[IntegrationCategory.Xbox];

			if (values.includes(steamIntegration) && values.includes(xboxIntegration))
				return {
					isValid:
						settings?.leaderboards.steam.channelId === channel.id &&
						settings?.leaderboards.xbox.channelId === channel.id,
					$set: { 'leaderboards.steam.channelId': null, 'leaderboards.xbox.channelId': null },
				};

			if (values.includes(steamIntegration))
				return {
					isValid: settings?.leaderboards.steam.channelId === channel.id,
					$set: { 'leaderboards.steam.channelId': null },
				};

			return {
				isValid: settings?.leaderboards.xbox.channelId === channel.id,
				$set: { 'leaderboards.xbox.channelId': null },
			};
		},
	};
	const { isValid, $set } = options[category]();
	if (!isValid)
		throw new Error(
			`${MessageCategory[category]} message is not assigned or all selected options aren't assigned to channel ${channel.name}.`,
		);

	await settingsModel.updateOne({ guildId }, { $set });
};

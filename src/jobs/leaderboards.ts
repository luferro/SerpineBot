import { EmbedBuilder } from 'discord.js';
import { Bot } from '../bot';
import * as Xbox from '../apis/xbox';
import * as Leaderboards from '../services/leaderboards';
import { settingsModel } from '../database/models/settings';
import { steamModel } from '../database/models/steam';
import { xboxModel } from '../database/models/xbox';
import { logger } from '../utils/logger';
import * as SleepUtil from '../utils/sleep';
import { IntegrationCategory, JobName } from '../types/enums';

export const data = {
	name: JobName.Leaderboards,
	schedule: '0 0 0 * * 0',
};

export const execute = async (client: Bot) => {
	const categories = Object.keys(IntegrationCategory)
		.filter((element) => !isNaN(Number(element)))
		.map(Number) as IntegrationCategory[];

	const leaderboards = {
		[IntegrationCategory.Steam]: await Leaderboards.getSteamLeaderboard(client),
		[IntegrationCategory.Xbox]: await Leaderboards.getXboxLeaderboard(client),
	};

	for (const [guildId, guild] of client.guilds.cache) {
		if (guildId === '223461927311900674') continue;
		const settings = await settingsModel.findOne({ guildId });

		const channels = {
			[IntegrationCategory.Steam]: settings?.leaderboards.steam.channelId,
			[IntegrationCategory.Xbox]: settings?.leaderboards.xbox.channelId,
		};

		for (const category of categories) {
			const leaderboard = leaderboards[category];
			if (leaderboard.length === 0) continue;

			const channelId = channels[category];
			if (!channelId) continue;

			const channel = await client.channels.fetch(channelId);
			if (!channel?.isTextBased()) continue;

			const embed = new EmbedBuilder()
				.setTitle(`Weekly ${IntegrationCategory[category]} Leaderboard`)
				.setDescription(leaderboard.join('\n'))
				.setFooter({ text: 'Leaderboard resets every sunday.' })
				.setColor('Random');

			await channel.send({ embeds: [embed] });

			logger.info(`Leaderboards job sent a message to channel _*${channelId}*_ in guild _*${guild.name}*_.`);
		}
	}

	await resetLeaderboards();
};

const resetLeaderboards = async () => {
	await steamModel.updateMany({}, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });

	const integrations = await xboxModel.find();
	for (const integration of integrations) {
		const { gamerscore } = await Xbox.getProfile(integration.profile.gamertag);
		await xboxModel.updateOne({ userId: integration.userId }, { $set: { 'profile.gamerscore': gamerscore } });
		await SleepUtil.timeout(5000);
	}
};

import { FeedType } from "@luferro/database";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: new Date(Date.now() + 1000 * 60) as unknown as string };

export const execute: JobExecute = async ({ client }) => {
	for (const [guildId, guild] of client.guilds.cache) {
		const birthdays = await client.db.birthday.getUpcomingBirthdays();
		for (const { userId, day, month, year } of birthdays) {
			const target = await guild.members.fetch(userId).catch(() => null);
			if (!target) continue;

			const date = new Date();
			date.setHours(0, 0, 0, 0);
			const birthdate = new Date(date.getFullYear(), month - 1, day);
			birthdate.setHours(0, 0, 0, 0);
			if (date.getTime() !== birthdate.getTime()) continue;

			await client.propagateToGuild({
				guildId,
				type: FeedType.BIRTHDAYS,
				everyone: true,
				messages: [
					new EmbedBuilder()
						.setTitle(t("jobs.birthdays.embed.title"))
						.setDescription(
							t("jobs.birthdays.embed.description", { username: target.user.username, age: date.getFullYear() - year }),
						)
						.setThumbnail(target.user.avatarURL() ?? target.user.defaultAvatarURL),
				],
			});
			client.logger.info(`Birthdays | ${target.user.username}'s birthday has been announced in guild ${guild.name}`);
		}
	}
};

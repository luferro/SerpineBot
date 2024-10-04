import { startOfDay, tz } from "@luferro/helpers/datetime";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import { FeedType } from "~/structures/Database.js";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "0 0 0 * * *" };

export const execute: JobExecute = async ({ client }) => {
	for (const [guildId, guild] of client.guilds.cache) {
		const birthdays = await client.db.birthday.getUpcomingBirthdays();
		for (const { userId, day, month, year } of birthdays) {
			const target = await guild.members.fetch(userId).catch(() => null);
			if (!target) continue;

			const date = startOfDay(Date.now(), { in: tz(client.getTimezone()) });
			const birthdate = startOfDay(new Date(date.getFullYear(), month - 1, day));
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

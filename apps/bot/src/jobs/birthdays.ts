import { FeedType } from "@luferro/database";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "0 0 0 * * *" };

export const execute: JobExecute = async ({ client }) => {
	const birthdays = await client.db.birthday.getUpcomingBirthdays();
	for (const { userId, day, month, year } of birthdays) {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const birthdate = new Date(date.getFullYear(), month - 1, day);
		birthdate.setHours(0, 0, 0, 0);
		if (date.getTime() !== birthdate.getTime()) continue;

		const target = await client.users.fetch(userId);
		const age = date.getFullYear() - year;

		await client.propagate({
			type: FeedType.BIRTHDAYS,
			everyone: true,
			messages: [
				new EmbedBuilder()
					.setTitle(t("jobs.birthdays.embed.title"))
					.setDescription(t("jobs.birthdays.embed.description", { username: target.username, age }))
					.setThumbnail(target.avatarURL() ?? target.defaultAvatarURL),
			],
		});
		client.logger.info(`Birthdays | ${target.username}'s birthday has been announced`);
	}
};

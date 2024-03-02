import { WebhookType } from "@luferro/database";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { JobData, JobExecute } from "../types/bot";

export const data: JobData = { schedule: "0 0 0 * * *" };

export const execute: JobExecute = async ({ client }) => {
	const birthdays = await client.prisma.birthday.findMany({
		where: {
			OR: [
				{ AND: [{ day: { gte: new Date().getDate() } }, { month: { equals: new Date().getMonth() + 1 } }] },
				{ month: { gte: new Date().getMonth() + 1 } },
			],
		},
	});

	for (const { userId, day, month, year } of birthdays) {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const birthdate = new Date(date.getFullYear(), month - 1, day);
		birthdate.setHours(0, 0, 0, 0);
		if (date.getTime() !== birthdate.getTime()) continue;

		const target = await client.users.fetch(userId);

		await client.propagate({
			type: WebhookType.BIRTHDAYS,
			everyone: true,
			messages: [
				new EmbedBuilder()
					.setTitle(t("jobs.birthdays.embed.title"))
					.setDescription(
						t("jobs.birthdays.embed.description", {
							username: target.username,
							age: date.getFullYear() - year,
						}),
					)
					.setThumbnail(target.avatarURL() ?? target.defaultAvatarURL),
			],
		});
		client.logger.info(`Birthdays | ${target.username}'s birthday has been announced`);
	}
};

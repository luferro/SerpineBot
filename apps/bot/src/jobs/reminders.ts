import { formatDate } from "@luferro/helpers/datetime";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "*/30 * * * * *" };

export const execute: JobExecute = async ({ client }) => {
	const reminders = await client.db.reminder.findMany({ where: { timeEnd: { lt: new Date() } } });
	for (const { id, userId, timeStart, message, locale, timezone } of reminders) {
		const target = await client.users.fetch(userId);
		if (!target) continue;

		await target.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(t("jobs.reminders.embed.title", { date: formatDate(timeStart, { locale, timezone }) }))
					.addFields([{ name: t("jobs.reminders.embed.fields.0.name"), value: message.trim() }])
					.setColor("Random"),
			],
		});
		client.logger.info(`Reminders | Reminder ${id} sent to ${target.username}`);

		await client.db.reminder.delete({ where: { id } });
	}
};

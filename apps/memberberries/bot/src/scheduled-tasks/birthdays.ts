import { startOfDay, tz } from "@luferro/utils/date";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import type { GuildMember } from "discord.js";
import { timezone } from "~/index.js";

export class BirthdaysTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 0 0 * * *",
			timezone,
		});
	}

	public async run() {
		const currentDate = new Date();
		const currentDay = currentDate.getDate();
		const currentMonth = currentDate.getMonth() + 1;
		const currentYear = currentDate.getFullYear();

		for (const [guildId, guild] of this.container.client.guilds.cache) {
			const storedWebhook = await this.container.db.query.webhooks.findFirst({
				where: (webhooks, { and, eq }) => and(eq(webhooks.guildId, guildId), eq(webhooks.type, "birthdays")),
			});
			if (!storedWebhook) continue;

			const webhook = await this.container.client.fetchWebhook(storedWebhook.id, storedWebhook.token);
			if (!webhook) continue;

			const birthdays = await this.container.db.query.birthdays.findMany({
				where: (birthdays, { sql, or, and, eq, gt, gte }) =>
					or(
						gt(sql`EXTRACT(MONTH FROM ${birthdays.birthdate})`, currentMonth),
						and(
							eq(sql`EXTRACT(MONTH FROM ${birthdays.birthdate})`, currentMonth),
							gte(sql`EXTRACT(DAY FROM ${birthdays.birthdate})`, currentDay),
						),
					),
			});
			const birthdaysMap = birthdays.reduce((acc, { userId, name, relation, birthdate }) => {
				const birthdays = [
					...(acc.get(userId) ?? []),
					{
						name,
						relation,
						birthdate: startOfDay(birthdate, { in: tz(this.container.config.timezone) }),
					},
				];
				acc.set(userId, birthdays);
				return acc;
			}, new Map<string, { name: string; relation: string; birthdate: Date }[]>());

			for (const [userId, userBirthdays] of birthdaysMap) {
				const target = await guild.members.fetch(userId).catch(() => null);
				if (!target) continue;

				for (const { name, relation, birthdate } of userBirthdays) {
					const age = currentYear - birthdate.getFullYear();
					const date = startOfDay(currentDate, { in: tz(this.container.config.timezone) });
					birthdate.setFullYear(currentYear);

					if (date.getTime() !== birthdate.getTime()) continue;

					await webhook.send({
						content: `${guild.roles.everyone} ${this.createBirthdayMessage(target, name, relation, age)}`,
					});
				}
			}
		}
	}

	private createBirthdayMessage(target: GuildMember, name: string, relation: string, age: number) {
		const getPossessiveForm = (user: string | GuildMember) => {
			const displayName = typeof user === "string" ? user : user.displayName;
			const possesiveForm = displayName.endsWith("s") ? "'" : "'s";
			return `${user}${possesiveForm}`;
		};

		const isSelf = relation === "self";
		const user = isSelf ? target : name;
		const targetPossessive = getPossessiveForm(target);
		const celebrant = isSelf ? targetPossessive : `${targetPossessive} ${relation} ${getPossessiveForm(name)}`;
		return `'Member ${celebrant} birthday? 🎉 Oh, I 'member!\nThey are turning ${age} today! 🎂\nHappy birthday, ${user}! 🥳`;
	}
}

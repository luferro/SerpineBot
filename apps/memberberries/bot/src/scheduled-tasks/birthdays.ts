import { getPossessive, getPossessiveForm, shuffle } from "@luferro/utils/data";
import { startOfDay } from "@luferro/utils/date";
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

		await this.container.propagate("birthdays", async ({ guild }) => {
			const upcomingBirthdays = await this.container.db.query.birthdays.findMany({
				where: (birthdays, { sql, or, and, eq, gt, gte }) =>
					or(
						gt(sql`EXTRACT(MONTH FROM ${birthdays.birthdate})`, currentMonth),
						and(
							eq(sql`EXTRACT(MONTH FROM ${birthdays.birthdate})`, currentMonth),
							gte(sql`EXTRACT(DAY FROM ${birthdays.birthdate})`, currentDay),
						),
					),
			});
			const birthdaysMap = upcomingBirthdays.reduce((acc, { userId, name, relation, birthdate }) => {
				const birthdays = [
					...(acc.get(userId) ?? []),
					{
						name,
						relation,
						birthdate: startOfDay(birthdate),
					},
				];
				acc.set(userId, birthdays);
				return acc;
			}, new Map<string, { name: string; relation: string; birthdate: Date }[]>());

			const messages = [];
			for (const [userId, userBirthdays] of birthdaysMap) {
				const target = await guild.members.fetch(userId).catch(() => null);
				if (!target) continue;

				for (const { name, relation, birthdate } of userBirthdays) {
					const age = currentYear - birthdate.getFullYear();
					const date = startOfDay(currentDate);
					birthdate.setFullYear(currentYear);
					if (date.getTime() !== birthdate.getTime()) continue;

					messages.push(`${guild.roles.everyone} ${this.createBirthdayMessage(target, name, relation, age)}`);
				}
			}

			return { name: this.name, skipCache: true, messages };
		});
	}

	private createBirthdayMessage(target: GuildMember, name: string, relation: string, age: number) {
		const isSelf = relation === "self";
		const targetPossessive = `${target}${getPossessive(target.displayName)}`;
		const celebrant = isSelf ? targetPossessive : `${targetPossessive} ${relation} ${getPossessiveForm(name)}`;

		const messages = [
			`'Member ${celebrant} birthday? 🎉 Oh, I 'member!\nThey are turning ${age} today! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`Ooh, 'member when ${celebrant} birthday was? 🎉 'Member? It's today!\nYeah, I 'member! ${age} years old! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`'Member birthdays? 🎉 'Member ${celebrant} special day?\nOoh, I 'member! It's right now! They're ${age}! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`You 'member ${celebrant} birthday? 🎉 I 'member!\n'Member they're turning ${age}? Ooh yeah, I 'member! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`'Member celebrations? 🎉 'Member ${celebrant} birthday?\nOh, I 'member! ${age} years today! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`Ooh, ooh! 'Member ${celebrant} birthday? 🎉\nYeah, I 'member! They're ${age} now! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`'Member getting older? 🎉 I 'member! 'Member ${celebrant} birthday?\nOoh, I 'member! It's today! ${age} years! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
			`Yeah, yeah! 'Member ${celebrant} birthday? 🎉 'Member?\nI 'member! They're ${age} today! Ooh, I love to 'member! 🎂\nHappy birthday, ${isSelf ? target : name}! 🥳`,
		];

		return shuffle(messages)[0];
	}
}

import { toSeconds } from "@luferro/utils/time";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { type APIEmbed, EmbedBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { reminders } from "~/db/schema.js";
import { timezone } from "~/index.js";

export class RemindersTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "*/30 * * * * *",
			timezone,
		});
	}

	public async run() {
		const storedReminders = await this.container.db.query.reminders.findMany({
			where: (reminders, { lt }) => lt(reminders.dueAt, new Date()),
		});
		for (const { id, userId, content, apiEmbeds, createdAt } of storedReminders) {
			const target = await this.container.client.users.fetch(userId);
			if (!target) continue;

			const message = `'Member that one message from <t:${toSeconds(createdAt.getTime())}:F>? Oh I 'member!`;
			const embeds = apiEmbeds?.map((embed) => EmbedBuilder.from(embed as APIEmbed)) ?? [];
			await target.send({ content: content ? `${message}\n${content}` : message, embeds });

			await this.container.db.delete(reminders).where(eq(reminders.id, id));
		}
	}
}

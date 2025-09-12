import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from "discord.js";
import { events } from "~/db/schema.js";
import { timezone } from "~/index.js";

export class EventsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 0 * * * *",
			timezone,
		});
	}

	public async run() {
		const upcomingEvents = await this.container.gql.igdb.getUpcomingEvents();
		for (const [guildId, guild] of this.container.client.guilds.cache) {
			const guildScheduledEvents = await guild.scheduledEvents.fetch();
			for (const { name, image, description, url, scheduledStartAt, scheduledEndAt } of upcomingEvents) {
				const scheduledEvent = {
					name,
					image,
					description: description ?? undefined,
					scheduledStartTime: scheduledStartAt,
					scheduledEndTime: scheduledEndAt,
					entityType: GuildScheduledEventEntityType.External,
					privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
					entityMetadata: {
						location: url.twitch ?? url.youtube ?? "TBD",
					},
				};

				const storedEvent = await this.container.db.query.events.findFirst({
					where: (events, { and, eq }) => and(eq(events.guildId, guildId), eq(events.name, name)),
				});
				if (storedEvent?.status === "expired" || storedEvent?.status === "cancelled") continue;

				const guildScheduledEvent = guildScheduledEvents
					.filter((event) => event.isScheduled())
					.find((event) => {
						const hasName = event.name === name;
						const hasImage = image && event.image === image;
						const hasDescription = description && event.description === description;
						return hasName || hasImage || hasDescription;
					});
				if (guildScheduledEvent) {
					await guild.scheduledEvents.edit(guildScheduledEvent, scheduledEvent);
					continue;
				}

				await guild.scheduledEvents.create(scheduledEvent);
				await this.container.db.insert(events).values({ guildId, name, status: "scheduled" });
			}
		}
	}
}

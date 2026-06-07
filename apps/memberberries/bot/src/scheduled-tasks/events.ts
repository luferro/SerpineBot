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
				const storedEvent = await this.container.db.query.events.findFirst({
					where: (events, { and, eq }) => and(eq(events.guildId, guildId), eq(events.name, name)),
				});
				if (storedEvent?.status === "expired" || storedEvent?.status === "cancelled") continue;

				const newEvent = {
					name,
					image,
					description: description ?? undefined,
					scheduledStartTime: scheduledStartAt,
					scheduledEndTime: scheduledEndAt,
					entityType: GuildScheduledEventEntityType.External,
					privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
					entityMetadata: {
						location: url ?? "TBD",
					},
				};
				const isNewLocationUnknown = newEvent.entityMetadata.location === "TBD";

				const oldEvent = guildScheduledEvents.find(
					(guildScheduledEvent) => guildScheduledEvent.isScheduled() && guildScheduledEvent.name === newEvent.name,
				);

				if (oldEvent) {
					const oldEventLocation = oldEvent.entityMetadata?.location;
					const newEventLocation = newEvent.entityMetadata.location;

					const eventUpdate = {
						...newEvent,
						scheduledStartTime: oldEvent.scheduledStartAt ?? newEvent.scheduledStartTime,
						scheduledEndTime: oldEvent.scheduledEndAt ?? newEvent.scheduledEndTime,
						entityMetadata: {
							location: isNewLocationUnknown ? (oldEventLocation ?? newEventLocation) : newEventLocation,
						},
					};

					await guild.scheduledEvents
						.edit(oldEvent, eventUpdate)
						.catch((error) => this.container.logger.error({ error, oldEvent, newEvent }));
					continue;
				}

				await guild.scheduledEvents
					.create(newEvent)
					.catch((error) => this.container.logger.error({ error, event: newEvent }));
				await this.container.db.insert(events).values({ guildId, name, status: "scheduled" });
			}
		}
	}
}

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

				const event = {
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

				const guildScheduledEvent = guildScheduledEvents
					.filter((guildScheduledEvent) => guildScheduledEvent.isScheduled())
					.find((guildScheduledEvent) => {
						const hasSameName = guildScheduledEvent.name === event.name;
						const hasSameUrl = guildScheduledEvent.url === event.entityMetadata.location;
						const hasSameImage = event.image && guildScheduledEvent.image === event.image;
						const hasSameDescription = event.description && guildScheduledEvent.description === event.description;
						return hasSameName || hasSameUrl || hasSameImage || hasSameDescription;
					});
				if (guildScheduledEvent) {
					await guild.scheduledEvents.edit(guildScheduledEvent, event);
					continue;
				}

				await guild.scheduledEvents.create(event);
				await this.container.db.insert(events).values({ guildId, name, status: "scheduled" });
			}
		}
	}
}

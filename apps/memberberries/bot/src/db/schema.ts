import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	integer,
	json,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true })
	.$onUpdate(() => new Date())
	.notNull();

export const webhookEnum = pgEnum("webhook", [
	"birthdays",
	"events",
	"freebies",
	"leaderboards",
	"reddit",
	"reviews",
	"rss",
]);
export const statusEnum = pgEnum("status", ["scheduled", "active", "expired", "cancelled"]);
export const integrationEnum = pgEnum("integration", ["steam"]);

export const guilds = pgTable("guilds", {
	id: text("id").primaryKey(),
	locale: text("locale").default("pt-PT").notNull(),
	timezone: text("timezone").default("Europe/Lisbon").notNull(),
	createdAt,
	updatedAt,
});

export const guildsRelations = relations(guilds, ({ many }) => ({
	webhooks: many(webhooks),
	events: many(events),
	pairings: many(pairings),
}));

export const webhooks = pgTable("webhooks", {
	id: text("id").primaryKey(),
	guildId: text("guild_id")
		.references(() => guilds.id, { onDelete: "cascade" })
		.notNull(),
	channelId: text("channel_id").notNull(),
	token: text("token").notNull(),
	createdAt,
	updatedAt,
});

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
	guild: one(guilds, { fields: [webhooks.guildId], references: [guilds.id] }),
	types: many(webhookTypes),
	feeds: many(webhookFeeds),
}));

export const webhookTypes = pgTable(
	"webhook_types",
	{
		webhookId: text("webhook_id")
			.references(() => webhooks.id, { onDelete: "cascade" })
			.notNull(),
		type: webhookEnum("type").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [primaryKey({ columns: [table.webhookId, table.type] })],
);

export const webhookTypesRelations = relations(webhookTypes, ({ one }) => ({
	webhook: one(webhooks, {
		fields: [webhookTypes.webhookId],
		references: [webhooks.id],
	}),
}));

export const feeds = pgTable("feeds", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	path: text("path").notNull(),
	createdAt,
	updatedAt,
});

export const feedsRelations = relations(feeds, ({ many }) => ({
	webhookFeeds: many(webhookFeeds),
}));

export const webhookFeeds = pgTable(
	"webhook_feeds",
	{
		webhookId: text("webhook_id")
			.references(() => webhooks.id, { onDelete: "cascade" })
			.notNull(),
		feedId: integer("feed_id")
			.references(() => feeds.id, { onDelete: "cascade" })
			.notNull(),
		type: webhookEnum("type").notNull(),
		options: json("options").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [primaryKey({ columns: [table.webhookId, table.feedId, table.type] })],
);

export const webhookFeedsRelations = relations(webhookFeeds, ({ one }) => ({
	webhook: one(webhooks, {
		fields: [webhookFeeds.webhookId],
		references: [webhooks.id],
	}),
	feed: one(feeds, {
		fields: [webhookFeeds.feedId],
		references: [feeds.id],
	}),
}));

export const events = pgTable("events", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	guildId: text("guild_id").notNull(),
	name: text("name").notNull(),
	status: statusEnum().default("scheduled").notNull(),
	createdAt,
	updatedAt,
});

export const eventsRelations = relations(events, ({ one }) => ({
	guild: one(guilds, { fields: [events.guildId], references: [guilds.id] }),
}));

export const pairings = pgTable("pairings", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	guildId: text("guild_id").notNull(),
	year: integer("year").notNull(),
	gifterId: text("gifter_id").notNull(),
	recipientId: text("recipient_id").notNull(),
	createdAt,
	updatedAt,
});

export const pairingsRelations = relations(pairings, ({ one }) => ({
	guild: one(guilds, { fields: [pairings.guildId], references: [guilds.id] }),
}));

export const birthdays = pgTable(
	"birthdays",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id").notNull(),
		name: text("name").notNull(),
		relation: text("relation").notNull(),
		birthdate: date("birthdate", { mode: "date" }).notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [uniqueIndex("user_name_relation_idx").on(table.userId, table.name, table.relation)],
);

export const reminders = pgTable("reminders", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	content: text("content").notNull(),
	apiEmbeds: json("embeds").array(),
	userId: text("user_id").notNull(),
	dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
	createdAt,
	updatedAt,
});

export const integrations = pgTable(
	"integrations",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		type: integrationEnum("type").notNull(),
		userId: text("user_id").notNull().unique(),
		notifications: boolean("notifications").default(true).notNull(),
		profile: json("profile").notNull(),
		wishlist: json("wishlist").array().notNull(),
		leaderboard: json("leaderboard").array().notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [uniqueIndex("type_user_idx").on(table.type, table.userId)],
);

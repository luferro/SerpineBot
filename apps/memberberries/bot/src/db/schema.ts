import { relations } from "drizzle-orm";
import { boolean, date, integer, json, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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

export const webhooks = pgTable(
	"webhooks",
	{
		id: text("id").primaryKey(),
		guildId: text("guild_id")
			.references(() => guilds.id, { onDelete: "cascade" })
			.notNull(),
		channelId: text("channel_id").notNull(),
		type: webhookEnum("type").notNull(),
		token: text("token").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [uniqueIndex("type_guild_channel_idx").on(table.type, table.guildId, table.channelId)],
);

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
	guild: one(guilds, { fields: [webhooks.guildId], references: [guilds.id] }),
	feeds: many(feeds),
}));

export const feeds = pgTable("feeds", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	webhookId: text("webhook_id").notNull(),
	feed: text("feed").notNull(),
	options: json("options").default({}).notNull(),
	createdAt,
	updatedAt,
});

export const feedsRelations = relations(feeds, ({ one, many }) => ({
	webhooks: many(webhooks),
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
		profile: json("profile").default({}).notNull(),
		wishlist: json("wishlist").array().default([]).notNull(),
		leaderboard: json("leaderboard").array().default([]).notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [uniqueIndex("type_user_idx").on(table.type, table.userId)],
);

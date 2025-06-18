import { Subcommand } from "@sapphire/plugin-subcommands";
import { ChannelType, MessageFlags, PermissionFlagsBits, type TextChannel } from "discord.js";
import { and, eq } from "drizzle-orm";
import { feeds, webhookToFeed, webhooks } from "~/db/schema.js";
import type { WebhookType } from "~/types/webhooks.js";

const WebhookTypeChoices: WebhookType[] = [
	"birthdays",
	"events",
	"freebies",
	"leaderboards",
	"reddit",
	"reviews",
	"rss",
];

export class WebhooksCommand extends Subcommand {
	constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			name: "webhooks",
			subcommands: [
				{ name: "create", chatInputRun: "chatInputCreateWebhook" },
				{ name: "delete", chatInputRun: "chatInputDeleteWebhook" },
			],
			requiredUserPermissions: [PermissionFlagsBits.ManageWebhooks],
			requiredClientPermissions: [PermissionFlagsBits.ManageWebhooks],
		});
	}

	override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("webhooks")
					.setDescription("Manage webhooks")
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
					.addSubcommand((command) =>
						command
							.setName("create")
							.setDescription("Create webhook")
							.addStringOption((option) => option.setName("name").setDescription("Webhook name").setRequired(true))
							.addStringOption((option) =>
								option
									.setName("type")
									.setDescription("Webhook type")
									.setChoices(WebhookTypeChoices.map((choice) => ({ name: choice.toUpperCase(), value: choice })))
									.setRequired(true),
							)
							.addChannelOption((option) =>
								option
									.setName("channel")
									.setDescription("Text channel")
									.addChannelTypes(ChannelType.GuildText)
									.setRequired(true),
							)
							.addStringOption((option) =>
								option.setName("paths").setDescription("RSS feeds or subreddits (e.g. <path1>;<path2>;<path3>)"),
							)
							.addStringOption((option) =>
								option
									.setName("sort")
									.setDescription("Subreddit sort")
									.addChoices([
										{ name: "Hot", value: "hot" },
										{ name: "Top", value: "top" },
										{ name: "New", value: "new" },
									]),
							)
							.addStringOption((option) =>
								option.setName("flairs").setDescription("Subreddit flairs (e.g. <flair1>;<flair2>;<flair3>)"),
							)
							.addIntegerOption((option) => option.setName("limit").setDescription("Subreddit limit")),
					)
					.addSubcommand((command) =>
						command
							.setName("delete")
							.setDescription("Delete webhook")
							.addStringOption((option) =>
								option
									.setName("type")
									.setDescription("Webhook type")
									.setChoices(WebhookTypeChoices.map((choice) => ({ name: choice.toUpperCase(), value: choice })))
									.setRequired(true),
							)
							.addChannelOption((option) =>
								option
									.setName("channel")
									.setDescription("Text channel")
									.addChannelTypes(ChannelType.GuildText)
									.setRequired(true),
							),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputCreateWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const name = interaction.options.getString("name", true);
		const type = interaction.options.getString("type", true) as WebhookType;
		const channel = interaction.options.getChannel("channel", true) as TextChannel;
		const paths = interaction.options.getString("paths")?.split(";") ?? [];
		const sort = interaction.options.getString("sort") ?? "new";
		const flairs = interaction.options.getString("flairs")?.split(";") ?? [];
		const limit = interaction.options.getString("limit") ?? 25;

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const { id, token } = await channel.createWebhook({ name });
		await this.container.db.insert(webhooks).values({ id, token, type, guildId, channelId: channel.id });

		if (type === "rss" || type === "reddit") {
			if (paths.length === 0) throw new Error(`Missing feeds field for ${type} webhook.`);
			const feedInputs = paths.map((path) => ({ path }));
			const insertedFeeds = await this.container.db.insert(feeds).values(feedInputs).onConflictDoNothing().returning();

			const webhookFeedInput = insertedFeeds.map((feed) => ({
				webhookId: id,
				feedId: feed.id,
				options: type === "reddit" ? { sort, limit, flairs } : {},
			}));
			await this.container.db.insert(webhookToFeed).values(webhookFeedInput);
		}

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `Webhook ${type} assigned to ${channel.name}.`,
		});
	}

	async chatInputDeleteWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const type = interaction.options.getString("type", true) as WebhookType;
		const channel = interaction.options.getChannel("channel", true) as TextChannel;

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		await this.container.db
			.delete(feeds)
			.where(and(eq(webhooks.type, type), eq(webhooks.guildId, guildId), eq(webhooks.channelId, channel.id)));

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `Webhook ${type} in ${channel.name} removed.`,
		});
	}
}

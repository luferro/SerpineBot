import { PaginatedMessageEmbedFields } from "@sapphire/discord.js-utilities";
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
				{ name: "link", chatInputRun: "chatInputLinkWebhook" },
				{ name: "list", chatInputRun: "chatInputListWebhook" },
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
									.addChannelTypes([ChannelType.GuildAnnouncement, ChannelType.GuildText])
									.setRequired(true),
							),
					)
					.addSubcommand((command) =>
						command
							.setName("link")
							.setDescription("Link subreddits or feeds to Reddit or RSS webhooks")
							.addStringOption((option) => option.setName("id").setDescription("Webhook id").setRequired(true))
							.addStringOption((option) =>
								option.setName("paths").setDescription("RSS feeds or subreddits (e.g. <path1>;<path2>;<path3>)"),
							)
							.addStringOption((option) =>
								option
									.setName("sort")
									.setDescription("Subreddit sort (defaults to 'New')")
									.addChoices([
										{ name: "Hot", value: "hot" },
										{ name: "Top", value: "top" },
										{ name: "New", value: "new" },
									]),
							)
							.addStringOption((option) =>
								option.setName("flairs").setDescription("Subreddit flairs (e.g. <flair1>;<flair2>;<flair3>)"),
							)
							.addIntegerOption((option) =>
								option.setName("limit").setDescription("Subreddit limit (defaults to '25')"),
							),
					)
					.addSubcommand((command) => command.setName("list").setDescription("List registered webhooks"))
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
									.addChannelTypes([ChannelType.GuildAnnouncement, ChannelType.GuildText])
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

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const { id, token } = await channel.createWebhook({ name });
		await this.container.db.insert(webhooks).values({ id, token, type, guildId, channelId: channel.id });

		return interaction.reply({ flags: MessageFlags.Ephemeral, content: `Webhook ${type} assigned to ${channel.name}` });
	}

	async chatInputLinkWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const id = interaction.options.getString("id", true);
		const paths = interaction.options.getString("paths", true).split(";");
		const sort = interaction.options.getString("sort") ?? "new";
		const flairs = interaction.options.getString("flairs")?.split(";") ?? [];
		const limit = interaction.options.getString("limit") ?? 25;

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const storedWebhook = await this.container.db.query.webhooks.findFirst({
			where: (webhooks, { eq }) => eq(webhooks.id, id),
		});
		if (!storedWebhook) throw new Error("Webhook is not registered.");

		const isRedditWebhook = storedWebhook.type === "reddit";
		const isRssWebhook = storedWebhook.type === "rss";
		if (!isRedditWebhook && !isRssWebhook) throw new Error("Cannot assign feeds or subreddits to selected webhook.");

		const feedInputs = paths.map((path) => ({ path }));
		const insertedFeeds = await this.container.db.insert(feeds).values(feedInputs).onConflictDoNothing().returning();
		const webhookFeedInput = insertedFeeds.map((feed) => ({
			webhookId: id,
			feedId: feed.id,
			options: isRedditWebhook ? { sort, limit, flairs } : {},
		}));
		await this.container.db.insert(webhookToFeed).values(webhookFeedInput);

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `Feeds successfully linked to webhook ${storedWebhook.id}`,
		});
	}

	async chatInputListWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const storedWebhooks = await this.container.db.query.webhooks.findMany();
		if (storedWebhooks.length === 0) throw new Error("No registered webhooks found.");

		const paginatedMessage = new PaginatedMessageEmbedFields()
			.setTemplate({ title: "Registered webhooks" })
			.setItems(
				storedWebhooks.map((storedWebhook) => ({
					name: `Webhook ${storedWebhook.type} in channel ${storedWebhook.channelId}`,
					value: storedWebhook.id,
					inline: false,
				})),
			)
			.setItemsPerPage(5);
		return paginatedMessage.make().run(interaction);
	}

	async chatInputDeleteWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const type = interaction.options.getString("type", true) as WebhookType;
		const channel = interaction.options.getChannel("channel", true) as TextChannel;

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const deletedWebhooks = await this.container.db
			.delete(webhooks)
			.where(and(eq(webhooks.type, type), eq(webhooks.guildId, guildId), eq(webhooks.channelId, channel.id)))
			.returning();
		for (const deletedWebhook of deletedWebhooks) {
			const webhook = await this.container.client.fetchWebhook(deletedWebhook.id, deletedWebhook.token);
			await webhook.delete();
		}

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `Webhook ${type} in ${channel.name} removed.`,
		});
	}
}

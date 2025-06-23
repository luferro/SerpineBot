import { PaginatedMessageEmbedFields } from "@sapphire/discord.js-utilities";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ChannelType, MessageFlags, PermissionFlagsBits, type TextChannel } from "discord.js";
import { eq } from "drizzle-orm";
import { feeds, webhookFeeds, webhookTypes, webhooks } from "~/db/schema.js";
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
				{ name: "assign", chatInputRun: "chatInputAssignWebhook" },
				{
					type: "group",
					name: "link",
					entries: [
						{ name: "rss", chatInputRun: "chatInputLinkWebhook" },
						{ name: "reddit", chatInputRun: "chatInputLinkWebhook" },
					],
				},
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
							.setName("assign")
							.setDescription("Assign types to a registered webhook")
							.addStringOption((option) => option.setName("id").setDescription("Webhook id").setRequired(true))
							.addStringOption((option) =>
								option
									.setName("type")
									.setDescription("Webhook type")
									.setChoices(WebhookTypeChoices.map((choice) => ({ name: choice.toUpperCase(), value: choice })))
									.setRequired(true),
							),
					)
					.addSubcommandGroup((group) =>
						group
							.setName("link")
							.setDescription("Link RSS feeds or subreddits to webhooks")
							.addSubcommand((command) =>
								command
									.setName("rss")
									.setDescription("Link subreddits or feeds to Reddit or RSS webhooks")
									.addStringOption((option) => option.setName("id").setDescription("Webhook id").setRequired(true))
									.addStringOption((option) => option.setName("feed").setDescription("RSS feed").setRequired(true)),
							)
							.addSubcommand((command) =>
								command
									.setName("reddit")
									.setDescription("Link subreddits or feeds to Reddit or RSS webhooks")
									.addStringOption((option) => option.setName("id").setDescription("Webhook id").setRequired(true))
									.addStringOption((option) => option.setName("feed").setDescription("Subreddit").setRequired(true))
									.addStringOption((option) =>
										option
											.setName("sort")
											.setDescription("Subreddit sort")
											.addChoices([
												{ name: "Hot", value: "hot" },
												{ name: "Top", value: "top" },
												{ name: "New", value: "new" },
											])
											.setRequired(true),
									)
									.addIntegerOption((option) =>
										option
											.setName("limit")
											.setDescription("Subreddit limit")
											.setMinValue(1)
											.setMaxValue(100)
											.setRequired(true),
									)
									.addStringOption((option) =>
										option.setName("flairs").setDescription("Subreddit flairs (e.g. <flair1>;<flair2>;<flair3>)"),
									),
							),
					)
					.addSubcommand((command) => command.setName("list").setDescription("List registered webhooks"))
					.addSubcommand((command) =>
						command
							.setName("delete")
							.setDescription("Delete webhook")
							.addStringOption((option) => option.setName("id").setDescription("Webhook id").setRequired(true)),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputCreateWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const name = interaction.options.getString("name", true);
		const channel = interaction.options.getChannel("channel", true) as TextChannel;

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const { id, token } = await channel.createWebhook({ name });
		await this.container.db.insert(webhooks).values({ id, token, guildId, channelId: channel.id });

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `Webhook ${name} with id ${id} assigned to #${channel.name}`,
		});
	}

	async chatInputAssignWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const id = interaction.options.getString("id", true);
		const type = interaction.options.getString("type", true) as WebhookType;

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const registeredWebhook = await this.container.db.query.webhooks.findFirst({
			where: (webhooks, { eq }) => eq(webhooks.id, id),
		});
		if (!registeredWebhook) throw new Error("Webhook is not registered.");

		await this.container.db.insert(webhookTypes).values({ webhookId: id, type }).onConflictDoNothing();

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `${type.toUpperCase()} assigned to webhook with id ${id}`,
		});
	}

	async chatInputLinkWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const id = interaction.options.getString("id", true);
		const feed = interaction.options.getString("feed", true);
		const sort = interaction.options.getString("sort");
		const limit = interaction.options.getInteger("limit");
		const flairs = interaction.options.getString("flairs")?.split(";") ?? [];

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const registeredWebhook = await this.container.db.query.webhooks.findFirst({
			where: (webhooks, { eq }) => eq(webhooks.id, id),
			with: { types: { columns: { type: true } } },
		});
		if (!registeredWebhook) throw new Error("Webhook is not registered.");

		const canBeLinked = registeredWebhook.types.some(({ type }) => ["rss", "reddit"].includes(type));
		if (!canBeLinked) throw new Error("Cannot assign feeds or subreddits to selected webhook.");

		const isRedditLink = Boolean(sort && limit);
		const type: WebhookType = isRedditLink ? "reddit" : "rss";
		const insertedFeeds = await this.container.db
			.insert(feeds)
			.values({ path: feed })
			.onConflictDoNothing()
			.returning();
		const webhookFeedInput = insertedFeeds.map((feed) => ({
			type,
			webhookId: id,
			feedId: feed.id,
			options: isRedditLink ? { sort, limit, flairs } : {},
		}));
		await this.container.db.insert(webhookFeeds).values(webhookFeedInput);

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `Feed successfully linked to webhook with id ${registeredWebhook.id}`,
		});
	}

	async chatInputListWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const registeredWebhooks = await this.container.db.query.webhooks.findMany({
			where: (webhooks, { eq }) => eq(webhooks.guildId, guildId),
			with: { types: { columns: { type: true } } },
		});
		if (registeredWebhooks.length === 0) throw new Error("No registered webhooks found.");

		const paginatedMessage = new PaginatedMessageEmbedFields()
			.setTemplate({ title: "Registered webhooks" })
			.setItems(
				registeredWebhooks.map((storedWebhook) => ({
					name: `${storedWebhook.types.map(({ type }) => type.toUpperCase()).join(" | ")} - channelId ${storedWebhook.channelId}`,
					value: `webhookId ${storedWebhook.id}`,
					inline: false,
				})),
			)
			.setItemsPerPage(5);
		return paginatedMessage.make().run(interaction);
	}

	async chatInputDeleteWebhook(interaction: Subcommand.ChatInputCommandInteraction) {
		const id = interaction.options.getString("id", true);

		const guildId = interaction.guildId;
		if (!guildId) throw new Error("Not in guild context.");

		const deletedWebhooks = await this.container.db.delete(webhooks).where(eq(webhooks.id, id)).returning();
		for (const deletedWebhook of deletedWebhooks) {
			const webhook = await this.container.client.fetchWebhook(deletedWebhook.id, deletedWebhook.token);
			await webhook.delete();
		}

		return interaction.reply({ flags: MessageFlags.Ephemeral, content: `Webhook with id ${id} deleted` });
	}
}

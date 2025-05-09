import { format } from "@luferro/utils/date";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { EmbedBuilder, type GuildMember, MessageFlags } from "discord.js";
import { and, eq } from "drizzle-orm";
import { integrations } from "~/db/schema.js";
import type { Integration, SteamProfile, SteamWishlistItem } from "~/types/integrations.js";

export class IntegrationsCommand extends Subcommand {
	constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			name: "steam",
			subcommands: [
				{
					name: "profile",
					chatInputRun: "chatInputSteamProfile",
				},
				{
					name: "wishlist",
					chatInputRun: "chatInputSteamWishlist",
				},
				{
					name: "recentlyplayed",
					chatInputRun: "chatInputSteamRecentlyPlayed",
				},
				{
					name: "sales",
					chatInputRun: "chatInputSteamSales",
				},
				{
					name: "integration",
					type: "group",
					entries: [
						{ name: "import", chatInputRun: "chatInputSteamImport" },
						{ name: "sync", chatInputRun: "chatInputSteamSync" },
						{ name: "delete", chatInputRun: "chatInputSteamDelete" },
						{ name: "notifications", chatInputRun: "chatInputSteamNotifications" },
					],
				},
			],
		});
	}

	override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("steam")
				.setDescription("Steam commands")
				.addSubcommand((command) =>
					command
						.setName("profile")
						.setDescription("Steam profile")
						.addMentionableOption((option) => option.setName("mention").setDescription("User mention")),
				)
				.addSubcommand((command) =>
					command
						.setName("wishlist")
						.setDescription("Steam wishlist")
						.addMentionableOption((option) => option.setName("mention").setDescription("User mention")),
				)
				.addSubcommand((command) =>
					command
						.setName("recentlyplayed")
						.setDescription("Steam recently played")
						.addMentionableOption((option) => option.setName("mention").setDescription("User mention")),
				)
				.addSubcommand((command) => command.setName("sales").setDescription("Upcoming sale dates"))
				.addSubcommandGroup((group) =>
					group
						.setName("integration")
						.setDescription("Manage your integration")
						.addSubcommand((command) =>
							command
								.setName("import")
								.setDescription("Import your profile")
								.addStringOption((option) => option.setName("url").setDescription("Profile url").setRequired(true)),
						)
						.addSubcommand((command) => command.setName("sync").setDescription("Manually trigger a wishlist sync"))
						.addSubcommand((command) =>
							command
								.setName("delete")
								.setDescription("Delete your integration (no more leaderboard or wishlist notifications)"),
						)
						.addSubcommand((command) =>
							command
								.setName("notifications")
								.setDescription("Toggle wishlist notifications")
								.addBooleanOption((option) => option.setName("value").setDescription("Toggle value").setRequired(true)),
						),
				),
		);
	}

	async chatInputSteamProfile(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const mention = interaction.options.getMentionable("user") as GuildMember | null;

		const { user } = mention ?? interaction;
		const integration = await this.getIntegration<SteamProfile>(user.id);
		if (!integration) throw new Error("Steam integration does not exist.");

		const { id } = integration.profile;
		const { name, image, status, logoutAt, createdAt } = await this.container.gql.steam.getProfile({ steamId64: id });

		const embed = new EmbedBuilder()
			.setTitle(user.username.endsWith("s") ? `${user.username}'` : `${user.username}'s Steam profile`)
			.setURL(`https://steamcommunity.com/profiles/${id}`)
			.setThumbnail(image)
			.addFields([
				{
					name: "SteamId64",
					value: id,
				},
				{
					name: "Username",
					value: name,
				},
				{
					name: "Status",
					value: status,
				},
				{
					name: "Created at",
					value: format(createdAt, "dd/MM/yyyy"),
					inline: true,
				},
				{
					name: "Logout at",
					value: format(logoutAt, "dd/MM/yyyy"),
					inline: true,
				},
			])
			.setColor("Random");

		await interaction.editReply({ embeds: [embed] });
	}

	async chatInputSteamWishlist(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const mention = interaction.options.getMentionable("mention") as GuildMember | null;

		const { user } = mention ?? interaction;
		const integration = await this.getIntegration<SteamProfile, SteamWishlistItem>(user.id);
		if (!integration) throw new Error("Steam integration does not exist.");

		const wishlist = await this.container.gql.steam.getWishlist({ steamId64: integration.profile.id });
		if (!wishlist) throw new Error("Steam wishlist must be set to public.");
		if (wishlist.length === 0) throw new Error("Steam wishlist is empty.");

		const paginatedMessage = new PaginatedMessage();

		const itemsPerPage = 10;
		for (let i = 0; i < wishlist.length; i += itemsPerPage) {
			paginatedMessage.addPageEmbed((embed) =>
				embed
					.setTitle(user.username.endsWith("s") ? `${user.username}'` : `${user.username}'s Steam wishlist`)
					.setURL(`https://store.steampowered.com/wishlist/profiles/${integration.profile.id}/#sort=order`)
					.setDescription(
						wishlist
							.slice(i, i + itemsPerPage)
							.map(
								({ priority, title, url, discounted, isFree }) =>
									`\`${priority}.\` **[${title}](${url})** | ${discounted || (isFree && "Free") || "n/a"}`,
							)
							.join("\n"),
					)
					.setColor("Random"),
			);
		}

		return paginatedMessage.run(interaction);
	}

	async chatInputSteamRecentlyPlayed(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const mention = interaction.options.getMentionable("mention") as GuildMember | null;

		const { user } = mention ?? interaction;
		const integration = await this.getIntegration<SteamProfile, SteamWishlistItem>(user.id);
		if (!integration) throw new Error("Steam integration does not exist.");

		const recentlyPlayed = await this.container.gql.steam.getRecentlyPlayed({ steamId64: integration.profile.id });
		if (recentlyPlayed.length === 0) throw new Error("There are no recently played games.");

		const paginatedMessage = new PaginatedMessage();

		const itemsPerPage = 10;
		for (let i = 0; i < recentlyPlayed.length; i += itemsPerPage) {
			paginatedMessage.addPageEmbed((embed) =>
				embed
					.setTitle(user.username.endsWith("s") ? `${user.username}'` : `${user.username}'s Steam recently played`)
					.setURL(`https://steamcommunity.com/profiles/${integration.profile.id}/games/`)
					.setDescription(
						recentlyPlayed
							.slice(i, i + itemsPerPage)
							.map(
								({ title, url, biweeklyHours, totalHours }) =>
									`**[${title}](${url})** | Last two weeks: **${biweeklyHours}h** | Total played: **${totalHours}h**`,
							)
							.join("\n"),
					)
					.setColor("Random"),
			);
		}

		return paginatedMessage.run(interaction);
	}

	async chatInputSteamSales(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();

		const { sale, status, upcoming } = await this.container.gql.steam.getUpcomingSales();
		if (!sale) throw new Error("No active or upcoming sales found.");

		const description = [sale];
		if (status) description.push(`*(${status})*`);

		const embed = new EmbedBuilder()
			.setTitle("When is the next Steam sale?")
			.setDescription(description.join("\n"))
			.addFields([
				{
					name: "Upcoming sales",
					value: upcoming.join("\n") || "n/a",
				},
			])
			.setColor("Random");

		await interaction.editReply({ embeds: [embed] });
	}

	async chatInputSteamImport(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const url = interaction.options.getString("url", true);

		const integration = await this.getIntegration(interaction.user.id);
		if (integration) throw new Error("Steam integration already exists.");

		const urlMatches = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
		if (!urlMatches) throw new Error("Invalid Steam profile url provided.");

		const { 1: type, 2: id } = urlMatches;
		const steamId64 = type === "id" ? await this.container.gql.steam.getSteamId64({ vanityUrl: id }) : id;
		if (!steamId64) throw new Error("Could not retrieve steamId64.");

		const wishlist = await this.container.gql.steam.getWishlist({ steamId64 });
		if (!wishlist) throw new Error("Steam wishlist must be set to public.");

		const recentlyPlayed = await this.container.gql.steam.getRecentlyPlayed({ steamId64 });

		await this.container.db.insert(integrations).values({
			type: "steam",
			userId: interaction.user.id,
			profile: { id: steamId64, url: `https://steamcommunity.com/profiles/${steamId64}` },
			wishlist: wishlist.map((game) => ({
				...game,
				notified: {
					sale: Boolean(game.discount),
					release: game.isReleased,
				},
			})),
			leaderboard: recentlyPlayed.map((game) => ({ ...game, weeklyHours: 0 })),
		});

		const embed = new EmbedBuilder().setTitle("Steam profile imported successfully").setColor("Random");
		await interaction.editReply({ embeds: [embed] });
	}

	async chatInputSteamSync(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const integration = await this.getIntegration<SteamProfile, SteamWishlistItem>(interaction.user.id);
		if (!integration) throw new Error("Steam integration does not exist.");

		const wishlist = await this.container.gql.steam.getWishlist({ steamId64: integration.profile.id });
		if (!wishlist) throw new Error("Steam wishlist must be set to public.");

		const updatedWishlist = wishlist.map((game) => {
			const storedGame = integration.wishlist.find((storedGame) => storedGame.id === game.id);
			return {
				...game,
				notified: {
					sale: storedGame?.notified.sale ?? Boolean(game.discount),
					release: storedGame?.notified.release ?? game.isReleased,
				},
			};
		});

		await this.container.db
			.update(integrations)
			.set({ wishlist: updatedWishlist })
			.where(and(eq(integrations.type, "steam"), eq(integrations.userId, interaction.user.id)));

		const embed = new EmbedBuilder().setTitle("Steam integration synchronized successfully.").setColor("Random");
		await interaction.editReply({ embeds: [embed] });
	}

	async chatInputSteamDelete(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const integration = await this.getIntegration(interaction.user.id);
		if (!integration) throw new Error("Steam integration does not exist.");

		await this.container.db
			.delete(integrations)
			.where(and(eq(integrations.type, "steam"), eq(integrations.userId, interaction.user.id)));

		const embed = new EmbedBuilder().setTitle("Steam integration deleted successfully").setColor("Random");
		await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
	}

	async chatInputSteamNotifications(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const value = interaction.options.getBoolean("value", true);

		const integration = await this.getIntegration(interaction.user.id);
		if (!integration) throw new Error("Steam integration does not exist.");

		await this.container.db
			.update(integrations)
			.set({ notifications: value })
			.where(and(eq(integrations.type, "steam"), eq(integrations.userId, interaction.user.id)));

		const embed = new EmbedBuilder()
			.setTitle(`Steam integration wishlist notifications have been turned ${value ? "on" : "off"}.`)
			.setColor("Random");

		await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
	}

	private getIntegration<TProfile = unknown, TWishlist = unknown>(userId: string) {
		return this.container.db.query.integrations.findFirst({
			where: (integrations, { and, eq }) => and(eq(integrations.type, "steam"), eq(integrations.userId, userId)),
		}) as Promise<Integration<TProfile, TWishlist> | undefined>;
	}
}

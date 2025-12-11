import { formatCurrency } from "@luferro/utils/currency";
import { addYears, startOfDay } from "@luferro/utils/date";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ActionRowBuilder, MessageFlags, PermissionFlagsBits, UserSelectMenuBuilder } from "discord.js";
import { and, eq, like } from "drizzle-orm";
import { pairings, reminders } from "~/db/schema.js";

export class RemindersCommand extends Subcommand {
	constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			name: "secret-santa",
			subcommands: [
				{ name: "organize", chatInputRun: "chatInputOrganizeSecretSanta" },
				{
					name: "cancel",
					chatInputRun: "chatInputCancelSecretSanta",
					requiredUserPermissions: [PermissionFlagsBits.Administrator],
					requiredClientPermissions: [PermissionFlagsBits.Administrator],
				},
			],
		});
	}

	override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("secret-santa")
					.setDescription("Manage Secret Santa events")
					.addSubcommand((command) =>
						command
							.setName("organize")
							.setDescription("Organize a Secret Santa")
							.addIntegerOption((option) =>
								option.setName("value").setDescription("Gift value (€)").setMinValue(5).setRequired(true),
							),
					)
					.addSubcommand((command) => command.setName("cancel").setDescription("Cancel Secret Santa"))
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputOrganizeSecretSanta(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();

		const value = interaction.options.getInteger("value", true);

		const eventDate = this.getEventDate();
		const currentYearPairings = await this.container.db.query.pairings.findFirst({
			where: (pairings, { eq }) => eq(pairings.year, eventDate.getFullYear()),
		});
		if (currentYearPairings) throw new Error(`There is already an ongoing Secret Santa ${eventDate.getFullYear()}.`);

		return interaction.editReply({
			content: `Gift value set to ${formatCurrency(value)}.`,
			components: [
				new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
					new UserSelectMenuBuilder()
						.setCustomId("secret-santa-setup")
						.setPlaceholder("Please select at least 3 users.")
						.setMinValues(3)
						.setMaxValues(25),
				),
			],
		});
	}

	async chatInputCancelSecretSanta(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const eventYear = this.getEventDate().getFullYear();
		const activePairings = await this.container.db.query.pairings.findMany({
			where: (pairings, { eq }) => eq(pairings.year, eventYear),
		});
		for (const { gifterId } of activePairings) {
			const gifter = await this.container.client.users.fetch(gifterId);
			const dmMessages = await gifter.dmChannel?.messages.fetch({ limit: 100 });
			const eventMessage = dmMessages?.find((message) =>
				message.embeds[0].title?.includes(`Secret Santa ${eventYear}`),
			);
			if (eventMessage?.deletable) await eventMessage.delete();

			await this.container.db
				.delete(reminders)
				.where(and(eq(reminders.userId, gifterId), like(reminders.content, `Secret Santa ${eventYear}%`)));
		}
		await this.container.db.delete(pairings).where(eq(pairings.year, eventYear));

		return interaction.editReply({ content: `Secret Santa ${eventYear} cancelled.` });
	}

	private getEventDate() {
		const eventDate = startOfDay(new Date(new Date().getFullYear(), 11, 25));
		return eventDate.getTime() >= Date.now() ? eventDate : addYears(eventDate, 1);
	}
}

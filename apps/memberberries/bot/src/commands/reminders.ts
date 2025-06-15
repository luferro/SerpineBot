import { toSeconds } from "@luferro/utils/time";
import { PaginatedMessageEmbedFields } from "@sapphire/discord.js-utilities";
import { Subcommand } from "@sapphire/plugin-subcommands";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	type ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { eq } from "drizzle-orm";
import { reminders } from "~/db/schema.js";

export class RemindersCommand extends Subcommand {
	constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			name: "reminders",
			subcommands: [
				{ name: "create", chatInputRun: "chatInputCreateReminder" },
				{ name: "list", chatInputRun: "chatInputListReminders" },
				{ name: "delete", chatInputRun: "chatInputDeleteReminder" },
			],
		});
	}

	override registerApplicationCommands(registry: Subcommand.Registry) {
		registry
			.registerContextMenuCommand(
				(builder) => builder.setName("Remind me in...").setType(ApplicationCommandType.Message),
				{ guildIds: this.container.guildIds },
			)
			.registerChatInputCommand(
				(builder) =>
					builder
						.setName("reminders")
						.setDescription("Manage your reminders")
						.addSubcommand((command) => command.setName("create").setDescription("Create a custom message reminder"))
						.addSubcommand((command) => command.setName("list").setDescription("List all of your reminders"))
						.addSubcommand((command) =>
							command
								.setName("delete")
								.setDescription("Delete a specific reminder")
								.addIntegerOption((option) => option.setName("id").setDescription("Reminder ID").setRequired(true)),
						),
				{ guildIds: this.container.guildIds },
			);
	}

	async contextMenuRun(interaction: Subcommand.ContextMenuCommandInteraction) {
		if (!interaction.isMessageContextMenuCommand()) return;

		const modal = new ModalBuilder()
			.setCustomId("reminder-setup")
			.setTitle("Create reminder")
			.addComponents(
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("reminder-in")
						.setLabel("Remind me in...")
						.setPlaceholder("1d")
						.setRequired(true)
						.setStyle(TextInputStyle.Short),
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("reminder-message-id")
						.setLabel("Message ID")
						.setValue(interaction.targetMessage.id)
						.setRequired(true)
						.setStyle(TextInputStyle.Short),
				),
			);

		return interaction.showModal(modal);
	}

	async chatInputCreateReminder(interaction: Subcommand.ChatInputCommandInteraction) {
		const modal = new ModalBuilder()
			.setCustomId("reminder-setup")
			.setTitle("Create reminder")
			.addComponents(
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("reminder-in")
						.setLabel("Remind me in...")
						.setPlaceholder("1d")
						.setRequired(true)
						.setStyle(TextInputStyle.Short),
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("reminder-message")
						.setLabel("About...")
						.setRequired(true)
						.setStyle(TextInputStyle.Paragraph),
				),
			);

		return interaction.showModal(modal);
	}

	async chatInputListReminders(interaction: Subcommand.ChatInputCommandInteraction) {
		const reminders = await this.container.db.query.reminders.findMany({
			where: (reminders, { eq }) => eq(reminders.userId, interaction.user.id),
		});

		const paginatedMessage = new PaginatedMessageEmbedFields()
			.setTemplate({ title: "Reminders" })
			.setItems(
				reminders.map((reminder) => ({
					name: reminder.id.toString(),
					value: `<t:${toSeconds(reminder.dueAt.getTime())}:F>`,
					inline: false,
				})),
			)
			.setItemsPerPage(5);
		return paginatedMessage.make().run(interaction);
	}

	async chatInputDeleteReminder(interaction: Subcommand.ChatInputCommandInteraction) {
		const reminderId = interaction.options.getInteger("id", true);
		return this.container.db.delete(reminders).where(eq(reminders.id, reminderId));
	}
}

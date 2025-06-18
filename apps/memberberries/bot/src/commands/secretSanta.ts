import { formatCurrency } from "@luferro/utils/currency";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ActionRowBuilder, UserSelectMenuBuilder } from "discord.js";

export class RemindersCommand extends Subcommand {
	constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			name: "secret-santa",
			subcommands: [{ name: "organize", chatInputRun: "chatInputOrganizeSecretSanta" }],
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
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputOrganizeSecretSanta(interaction: Subcommand.ChatInputCommandInteraction) {
		const value = interaction.options.getInteger("value", true);

		const currentYear = new Date().getFullYear();
		const currentYearPairings = await this.container.db.query.pairings.findFirst({
			where: (pairings, { eq }) => eq(pairings.year, currentYear),
		});
		if (currentYearPairings) throw new Error(`There is already an ongoing Secret Santa ${currentYear}.`);

		return interaction.reply({
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
}

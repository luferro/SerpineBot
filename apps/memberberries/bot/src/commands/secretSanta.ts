import { formatCurrency } from "@luferro/utils/currency";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { MessageFlags } from "discord.js";
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
		registry.registerChatInputCommand((builder) =>
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
		);
	}

	async chatInputOrganizeSecretSanta(interaction: Subcommand.ChatInputCommandInteraction) {
		const value = interaction.options.getInteger("value", true);

		return interaction.reply({
			flags: MessageFlags.Ephemeral,
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

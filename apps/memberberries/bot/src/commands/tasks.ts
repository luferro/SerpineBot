import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capitalize } from "@luferro/utils/data";
import { Command } from "@sapphire/framework";
import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";

const tasks = fs
	.readdirSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../scheduled-tasks"), { withFileTypes: true })
	.filter((item) => item.isFile())
	.map((item) => path.parse(item.name).name);

export class TasksCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "tasks",
			requiredUserPermissions: [PermissionFlagsBits.Administrator],
			requiredClientPermissions: [PermissionFlagsBits.Administrator],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("tasks")
					.setDescription("Manually trigger a scheduled task")
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.addStringOption((option) =>
						option
							.setName("name")
							.setDescription("Scheduled task name")
							.addChoices(tasks.map((task) => ({ name: capitalize(task), value: task })))
							.setRequired(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const name = interaction.options.getString("name", true);

		const scheduledTasks = this.container.stores.get("scheduled-tasks");
		const scheduledTask = scheduledTasks.get(name);
		if (!scheduledTask) throw new Error("Failed to retrieve scheduled task");

		await scheduledTask.run(undefined);

		const embed = new EmbedBuilder().setTitle(`Task ${name} has been manually triggered`).setColor("Random");
		await interaction.editReply({ embeds: [embed] });
	}
}

import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class HowLongToBeatCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "hltb",
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("hltb")
					.setDescription("How long does it take to beat your favorite game?")
					.addStringOption((command) =>
						command.setName("game").setDescription("Game title").setRequired(true).setAutocomplete(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const id = interaction.options.getString("game", true);

		const { title, url, image, main, mainExtra, completionist } = await this.container.gql.hltb.getPlaytimes({ id });
		if (!main && !mainExtra && !completionist) throw new Error("No playtimes found.");

		const embed = new EmbedBuilder()
			.setTitle(`How long to beat \`${title}\`?`)
			.setURL(url)
			.setThumbnail(image ?? null)
			.addFields([
				{
					name: "**Main Story**",
					value: main ? `~${main}` : "n/a",
					inline: true,
				},
				{
					name: "**Main Story + Extras**",
					value: mainExtra ? `~${mainExtra}` : "n/a",
					inline: true,
				},
				{
					name: "**Completionist**",
					value: completionist ? `~${completionist}` : "n/a",
					inline: true,
				},
			])
			.setColor("Random");

		await interaction.editReply({ embeds: [embed] });
	}
}

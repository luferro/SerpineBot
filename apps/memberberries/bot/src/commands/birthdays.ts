import { capitalize } from "@luferro/utils/data";
import { format, isDate, isMatch } from "@luferro/utils/date";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { and, eq } from "drizzle-orm";
import { birthdays } from "~/db/schema.js";

export class BirthdaysCommand extends Subcommand {
	constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			name: "birthdays",
			subcommands: [
				{ name: "create", chatInputRun: "chatInputCreateBirthday" },
				{ name: "delete", chatInputRun: "chatInputDeleteBirthday" },
				{ name: "list", chatInputRun: "chatInputListBirthdays" },
			],
		});
	}

	override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("birthdays")
				.setDescription("Manage your birthday entry")
				.addSubcommand((command) =>
					command
						.setName("create")
						.setDescription("Create an entry for your birthday")
						.addIntegerOption((option) => option.setName("day").setDescription("Birthdate day").setRequired(true))
						.addIntegerOption((option) => option.setName("month").setDescription("Birthdate month").setRequired(true))
						.addIntegerOption((option) =>
							option
								.setName("year")
								.setDescription("Birthdate year")
								.setMinValue(1900)
								.setMaxValue(new Date().getFullYear())
								.setRequired(true),
						)
						.addStringOption((option) => option.setName("name").setDescription("Relation member name"))
						.addStringOption((option) => option.setName("relation").setDescription("Relation type")),
				)
				.addSubcommand((command) =>
					command
						.setName("delete")
						.setDescription("Delete your birthday entry")
						.addStringOption((option) => option.setName("name").setDescription("Name"))
						.addStringOption((option) => option.setName("relation").setDescription("Relation")),
				)
				.addSubcommand((command) =>
					command
						.setName("list")
						.setDescription("Lists birthday entries")
						.addIntegerOption((option) => option.setName("month").setDescription("Month")),
				),
		);
	}

	async chatInputCreateBirthday(interaction: Subcommand.ChatInputCommandInteraction) {
		const name = interaction.options.getString("name");
		const relation = interaction.options.getString("relation");
		const day = interaction.options.getInteger("day", true);
		const month = interaction.options.getInteger("month", true);
		const year = interaction.options.getInteger("year", true);

		if (!isMatch(`${year}-${month}-${day}`, "yyyy-MM-dd")) throw new Error("Invalid birthdate.");

		await this.container.db.insert(birthdays).values({
			userId: interaction.user.id,
			name: name ?? interaction.user.username,
			relation: relation ?? "self",
			birthdate: new Date(Date.UTC(year, month - 1, day)),
		});

		const embed = new EmbedBuilder().setTitle("Birthdate entry created.").setColor("Random");
		await interaction.reply({ embeds: [embed] });
	}

	async chatInputDeleteBirthday(interaction: Subcommand.ChatInputCommandInteraction) {
		const name = interaction.options.getString("name");
		const relation = interaction.options.getString("relation");

		await this.container.db
			.delete(birthdays)
			.where(
				and(
					eq(birthdays.userId, interaction.user.id),
					eq(birthdays.name, name ?? interaction.user.username),
					eq(birthdays.relation, relation ?? "self"),
				),
			);

		const embed = new EmbedBuilder().setTitle("Birthdate entry deleted.").setColor("Random");
		await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
	}

	async chatInputListBirthdays(interaction: Subcommand.ChatInputCommandInteraction) {
		const month = interaction.options.getInteger("month");

		if (month) {
			const date = new Date();
			date.setMonth(month - 1);
			const formattedMonth = capitalize(format(date, "MMMM"));

			const birthdays = await this.container.db.query.birthdays.findMany({
				where: (birthdays, { sql, eq }) => eq(sql`EXTRACT(MONTH FROM ${birthdays.birthdate})`, month),
			});
			if (birthdays.length === 0) throw new Error(`No results found for ${formattedMonth.toLowerCase()}.`);

			const sortedBirthdays = birthdays.sort(
				(a, b) => a.birthdate.getDate() - b.birthdate.getDate() && a.birthdate.getMonth() - b.birthdate.getMonth(),
			);

			const embed = new EmbedBuilder().setTitle(formattedMonth).setDescription(
				sortedBirthdays
					.map(({ name, birthdate }) => {
						const formattedDay = birthdate.getDate().toString().padStart(2, "0");
						const formattedMonth = month.toString().padStart(2, "0");
						return `**${formattedDay}/${formattedMonth}** ${name}`;
					})
					.join("\n"),
			);
			return interaction.reply({ embeds: [embed] });
		}

		const birthdays = await this.container.db.query.birthdays.findMany();
		if (birthdays.length === 0) throw new Error("No results found.");

		const groupedBirthdays = birthdays
			.sort((a, b) => a.birthdate.getDate() - b.birthdate.getDate() && a.birthdate.getMonth() - b.birthdate.getMonth())
			.reduce((acc, { name, relation, birthdate }) => {
				const formattedMonth = capitalize(format(birthdate, "MMMM"));

				const birthdays = [
					...(acc.get(formattedMonth) ?? []),
					{
						name,
						relation,
						birthdate,
					},
				];

				acc.set(formattedMonth, birthdays);
				return acc;
			}, new Map<string, { name: string; relation: string; birthdate: Date }[]>());

		const paginatedMessage = new PaginatedMessage();

		for (const [month, birthdays] of groupedBirthdays) {
			paginatedMessage.addPageEmbed((embed) =>
				embed.setTitle(month).setDescription(
					birthdays
						.map(({ name, birthdate }) => {
							const formattedDay = birthdate.getDate().toString().padStart(2, "0");
							const formattedMonth = (birthdate.getMonth() + 1).toString().padStart(2, "0");
							return `**${formattedDay}/${formattedMonth}** ${name}`;
						})
						.join("\n"),
				),
			);
		}

		return paginatedMessage.run(interaction);
	}
}

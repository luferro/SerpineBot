import { capitalize, getPossessiveForm } from "@luferro/utils/data";
import { format, isMatch, startOfMonth } from "@luferro/utils/date";
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
				{
					type: "group",
					name: "register",
					entries: [
						{ name: "me", chatInputRun: "chatInputRegisterBirthday" },
						{ name: "other", chatInputRun: "chatInputRegisterBirthday" },
					],
				},
				{
					type: "group",
					name: "remove",
					entries: [
						{ name: "me", chatInputRun: "chatInputRemoveBirthday" },
						{ name: "other", chatInputRun: "chatInputRemoveBirthday" },
					],
				},
				{ name: "list", chatInputRun: "chatInputListBirthdays" },
			],
		});
	}

	override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("birthdays")
					.setDescription("Manage birthday entries")
					.addSubcommandGroup((group) =>
						group
							.setName("register")
							.setDescription("Register a birthday for yourself or someone not in the guild")
							.addSubcommand((command) =>
								command
									.setName("me")
									.setDescription("Register a birthday for yourself")
									.addIntegerOption((option) => option.setName("day").setDescription("Day").setRequired(true))
									.addIntegerOption((option) => option.setName("month").setDescription("Month").setRequired(true))
									.addIntegerOption((option) =>
										option
											.setName("year")
											.setDescription("Year")
											.setMinValue(1900)
											.setMaxValue(new Date().getFullYear())
											.setRequired(true),
									),
							)
							.addSubcommand((command) =>
								command
									.setName("other")
									.setDescription(
										"Register a birthday for someone not in the guild — a friend, family member, or significant other",
									)
									.addStringOption((option) => option.setName("name").setDescription("Person's name").setRequired(true))
									.addStringOption((option) =>
										option.setName("relation").setDescription("Person's relation to you").setRequired(true),
									)
									.addIntegerOption((option) => option.setName("day").setDescription("Day").setRequired(true))
									.addIntegerOption((option) => option.setName("month").setDescription("Month").setRequired(true))
									.addIntegerOption((option) =>
										option
											.setName("year")
											.setDescription("Year")
											.setMinValue(1900)
											.setMaxValue(new Date().getFullYear())
											.setRequired(true),
									),
							),
					)
					.addSubcommandGroup((group) =>
						group
							.setName("remove")
							.setDescription("Remove yours or someone else's birthday entry")
							.addSubcommand((command) => command.setName("me").setDescription("Remove your birthday entry"))
							.addSubcommand((command) =>
								command
									.setName("other")
									.setDescription("Remove someone else's birthday entry")
									.addStringOption((option) => option.setName("name").setDescription("Person's name"))
									.addStringOption((option) => option.setName("relation").setDescription("Person's relation to you")),
							),
					)
					.addSubcommand((command) =>
						command
							.setName("list")
							.setDescription("Lists all registered birthday entries")
							.addIntegerOption((option) =>
								option.setName("month").setDescription("Month of the year").setMinValue(1).setMaxValue(12),
							),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRegisterBirthday(interaction: Subcommand.ChatInputCommandInteraction) {
		const name = interaction.options.getString("name");
		const relation = interaction.options.getString("relation");
		const day = interaction.options.getInteger("day", true);
		const month = interaction.options.getInteger("month", true);
		const year = interaction.options.getInteger("year", true);

		if (!isMatch(`${year}-${month}-${day}`, "yyyy-MM-dd")) throw new Error("Invalid birthdate.");

		const entry = {
			userId: interaction.user.id,
			name: name ?? interaction.user.username,
			relation: relation ?? "self",
			birthdate: new Date(Date.UTC(year, month - 1, day)),
		};

		const [{ createdAt, updatedAt }] = await this.container.db
			.insert(birthdays)
			.values(entry)
			.onConflictDoUpdate({
				target: [birthdays.userId, birthdays.name, birthdays.relation],
				set: entry,
				setWhere: and(
					eq(birthdays.userId, entry.userId),
					eq(birthdays.name, entry.name),
					eq(birthdays.relation, entry.relation),
				),
			})
			.returning();

		const action = createdAt.getTime() === updatedAt.getTime() ? "registered" : "updated";
		const target =
			name && relation
				? `${getPossessiveForm(interaction.user.displayName)} ${relation} ${name}`
				: interaction.user.displayName;
		const embed = new EmbedBuilder().setTitle(`Birthday entry ${action} for ${target}`).setColor("Random");
		await interaction.reply({ embeds: [embed] });
	}

	async chatInputRemoveBirthday(interaction: Subcommand.ChatInputCommandInteraction) {
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

		const target =
			name && relation
				? `${getPossessiveForm(interaction.user.displayName)} ${relation} ${name}`
				: interaction.user.displayName;
		const embed = new EmbedBuilder().setTitle(`Birthday entry removed for ${target}`).setColor("Random");
		await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
	}

	async chatInputListBirthdays(interaction: Subcommand.ChatInputCommandInteraction) {
		const month = interaction.options.getInteger("month");

		if (month) {
			const date = startOfMonth(new Date());
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

		const paginatedMessage = new PaginatedMessage().setSelectMenuOptions((pageIndex) => ({
			label:
				groupedBirthdays
					.keys()
					.toArray()
					.at(pageIndex - 1) ?? `Page ${pageIndex}`,
		}));
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

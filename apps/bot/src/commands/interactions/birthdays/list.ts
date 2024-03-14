import type { Birthday } from "@luferro/database";
import { DateUtil, StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.birthdays.list.name"))
	.setDescription(t("interactions.birthdays.list.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction, localization }) => {
	const birthdays = await client.prisma.birthday.findMany();
	const groupedBirthdays = birthdays
		.sort((a, b) => a.day - b.day && a.month - b.month)
		.reduce(
			(acc, birthday) => {
				const month = StringUtil.capitalize(
					DateUtil.format(new Date(birthday.year, birthday.month - 1, birthday.day), {
						format: "MMMM",
						...localization,
					}),
				);

				const index = acc.findIndex((entry) => entry.month === month);
				if (index === -1) acc.push({ month, birthdays: [birthday] });
				else acc[index] = { month, birthdays: acc[index].birthdays.concat(birthday) };

				return acc;
			},
			[] as { month: string; birthdays: Birthday[] }[],
		);
	if (groupedBirthdays.length === 0) throw new Error(t("errors.search.none"));

	const fields = await Promise.all(
		groupedBirthdays.map(async ({ month, birthdays }) => {
			const formattedBirthdays = await Promise.all(
				birthdays.map(async ({ userId, day, month }) => {
					const user = await interaction.client.users.fetch(userId);
					const formattedDay = day.toString().padStart(2, "0");
					const formattedMonth = month.toString().padStart(2, "0");
					return `**${formattedDay}/${formattedMonth}** ${user.username}`;
				}),
			);

			return { name: month, value: formattedBirthdays.join("\n") };
		}),
	);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.birthdays.list.embed.title"))
		.setFields(fields)
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};

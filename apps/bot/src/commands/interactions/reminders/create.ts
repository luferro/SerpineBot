import { toTimeUnit } from "@luferro/helpers/datetime";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

type TimeUnit = Parameters<typeof toTimeUnit>[1];

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.reminders.create.name"))
	.setDescription(t("interactions.reminders.create.description"))
	.addIntegerOption((option) =>
		option
			.setName(t("interactions.reminders.create.options.0.name"))
			.setDescription(t("interactions.reminders.create.options.0.description"))
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.reminders.create.options.1.name"))
			.setDescription(t("interactions.reminders.create.options.1.description"))
			.setRequired(true)
			.addChoices(
				...Array.from({ length: 7 }).map((_, index) => ({
					name: t(`interactions.reminders.create.options.1.choices.${index}.name`),
					value: t(`interactions.reminders.create.options.1.choices.${index}.name`),
				})),
			),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.reminders.create.options.2.name"))
			.setDescription(t("interactions.reminders.create.options.2.description"))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction, localization }) => {
	const time = interaction.options.getInteger(data.options[0].name, true);
	const unit = interaction.options.getString(data.options[1].name, true) as TimeUnit;
	const message = interaction.options.getString(data.options[2].name, true);

	if (unit === "Seconds" && time < 300) throw new Error(t("interactions.reminders.minimum.seconds"));
	if (unit === "Minutes" && time < 5) throw new Error(t("interactions.reminders.minimum.minutes"));

	const reminder = await client.db.reminder.create({
		data: {
			message,
			userId: interaction.user.id,
			timeStart: new Date(),
			timeEnd: new Date(Date.now() + toTimeUnit({ time, unit }, "Milliseconds")),
			...localization,
		},
	});

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.reminders.create.embed.title"))
		.setDescription(t("interactions.reminders.create.embed.description", { time, message, unit: unit.toLowerCase() }))
		.setFooter({ text: t("interactions.reminders.create.embed.footer.text", { reminderId: reminder.id }) })
		.setColor("Random");

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

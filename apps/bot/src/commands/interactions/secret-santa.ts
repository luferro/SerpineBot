import { randomUUID } from "node:crypto";
import { formatCurrency } from "@luferro/helpers/currency";
import { addYears, formatDate, startOfDay } from "@luferro/helpers/datetime";
import { shuffle } from "@luferro/helpers/transform";
import { EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = [
	new SlashCommandStringOption()
		.setName(t("interactions.secret-santa.options.0.name"))
		.setDescription(t("interactions.secret-santa.options.0.description"))
		.setRequired(true),
	new SlashCommandIntegerOption()
		.setName(t("interactions.secret-santa.options.1.name"))
		.setDescription(t("interactions.secret-santa.options.1.description"))
		.setMinValue(5)
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ client, interaction, localization }) => {
	const mentions = interaction.options.getString(data[0].name, true).match(/\d+/g);
	const value = interaction.options.getInteger(data[1].name, true);

	if (!mentions) throw new Error(t("errors.secret-santa.mentions.invalid"));

	const uniqueMentions = new Set(mentions);
	if (uniqueMentions.size !== mentions.length) throw new Error(t("errors.secret-santa.mentions.duplicate"));

	const users = await Promise.all(
		mentions
			.filter((id) => client.users.cache.has(id))
			.map(async (id) => {
				const user = await client.users.fetch(id);
				if (user.bot) throw new Error(t("errors.secret-santa.mentions.bot"));
				return { participantId: randomUUID(), user };
			}),
	);
	if (users.length < 3) throw new Error(t("errors.secret-santa.mentions.minimum"));

	const embed = new EmbedBuilder().setTitle(t("interactions.secret-santa.embeds.0.title")).setColor("Random");
	await interaction.reply({ embeds: [embed] });

	const date = getEventDate();
	const shuffledUsers = shuffle(users);
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const reminder = await client.db.reminder.create({
			data: {
				userId: gifter.user.id,
				timeStart: new Date(),
				timeEnd: date,
				message: t("interactions.secret-santa.reminder.message", { year: date.getFullYear() }),
				...localization,
			},
		});

		const embed = new EmbedBuilder()
			.setTitle(t("interactions.secret-santa.embeds.1.title", { year: date.getFullYear() }))
			.addFields([
				{
					name: t("interactions.secret-santa.embeds.1.fields.0.name"),
					value: formatDate(date, localization),
				},
				{
					name: t("interactions.secret-santa.embeds.1.fields.1.name"),
					value: formatCurrency(value, localization),
				},
				{
					name: t("interactions.secret-santa.embeds.1.fields.2.name"),
					value: receiver.user.username,
				},
			])
			.setFooter({ text: t("interactions.secret-santa.embeds.1.footer.text", { reminderId: reminder.id }) })
			.setColor("Random");

		await gifter.user.send({ embeds: [embed] });
		client.logger.debug({ gifterId: gifter.participantId, receiverId: receiver.participantId });
	}
};

const getEventDate = () => {
	const eventDate = startOfDay(new Date(new Date().getFullYear(), 11, 25));
	return eventDate.getTime() >= Date.now() ? eventDate : addYears(eventDate, 1);
};

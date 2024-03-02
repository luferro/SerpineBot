import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import { Bot } from "../../structures/Bot";
import type { EventData, EventExecute } from "../../types/bot";
import { ExtendedStringSelectMenuInteraction } from "../../types/interaction";

type Args = [interaction: ExtendedStringSelectMenuInteraction];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [interaction] }) => {
	const { guild, channel, member } = interaction;
	if (member.user.bot || !channel?.isTextBased()) return;

	const granted = [];
	const revoked = [];
	for (const value of interaction.values) {
		const role = guild.roles.cache.find(({ id }) => id === value);
		if (!role) continue;

		const restrictionsRole = guild.roles.cache.find(({ name }) => name === Bot.RESTRICTIONS_ROLE);
		if (restrictionsRole && member.roles.cache.has(restrictionsRole.id)) continue;

		if (!member.roles.cache.has(role.id)) {
			member.roles.add(role);
			granted.push(role.name);
			continue;
		}

		member.roles.remove(role);
		revoked.push(role.name);
	}

	const embed = new EmbedBuilder()
		.setTitle(t("events.roles.userRolesUpdate.embed.title", { granted: granted.length, revoked: revoked.length }))
		.addFields([
			{
				name: t("events.roles.userRolesUpdate.embed.fields.0.name"),
				value: granted.join("\n") || t("common.none"),
				inline: true,
			},
			{
				name: t("events.roles.userRolesUpdate.embed.fields.1.name"),
				value: revoked.join("\n") || t("common.none"),
				inline: true,
			},
		])
		.setColor("Random");

	await interaction.reply({ embeds: [embed], ephemeral: true });
	client.emit("rolesMessageUpdate", client);
};

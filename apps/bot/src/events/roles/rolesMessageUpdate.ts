import { ActionRowBuilder, type Collection, EmbedBuilder, type Message, StringSelectMenuBuilder } from "discord.js";
import { t } from "i18next";
import { Bot } from "../../structures/Bot";
import type { EventData, EventExecute } from "../../types/bot";

export const data: EventData = { type: "on" };

export const execute: EventExecute = async ({ client }) => {
	for (const { 0: guildId, 1: guild } of client.guilds.cache) {
		const settings = await client.prisma.guild.findUnique({ where: { id: guildId } });
		const channelId = settings?.roles.channelId;
		if (!channelId) continue;

		const channel = await client.channels.fetch(channelId);
		if (!channel?.isTextBased()) continue;

		const roles = settings.roles.options
			.map((id) => {
				const role = guild.roles.cache.find(({ id: nestedRoleId }) => nestedRoleId === id);
				return role ? { label: role.name, value: role.id } : null;
			})
			.filter((item): item is NonNullable<typeof item> => !!item);

		const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(Bot.ROLES_MESSAGE_ID)
				.setPlaceholder(t("events.roles.rolesMessageUpdate.menu.placeholder"))
				.setMaxValues(roles.length)
				.addOptions(roles),
		);

		const message = ((await channel.messages.fetch()) as Collection<string, Message>).find((message) => {
			const customId = message?.components[0]?.components[0]?.customId;
			return customId === Bot.ROLES_MESSAGE_ID;
		});

		if (message) {
			await message.edit({ components: [component] });
			continue;
		}

		await channel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(t("events.roles.rolesMessageUpdate.menu.title"))
					.setDescription(t("events.roles.rolesMessageUpdate.menu.description"))
					.setFooter({ text: t("events.roles.rolesMessageUpdate.menu.footer.text") })
					.setColor("Random"),
			],
			components: [component],
		});
	}
};

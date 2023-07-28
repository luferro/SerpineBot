import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { ActionRowBuilder, Collection, EmbedBuilder, Message, StringSelectMenuBuilder } from 'discord.js';

import { Bot } from '../../Bot';
import type { EventData, EventExecute } from '../../types/bot';

export const data: EventData = { type: 'on' };

export const execute: EventExecute = async ({ client }) => {
	for (const { 0: guildId, 1: guild } of client.guilds.cache) {
		const settings = await SettingsModel.getSettingsByGuildId({ guildId });
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

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(Bot.ROLES_MESSAGE_ID)
			.setPlaceholder('Nothing selected.')
			.setMaxValues(roles.length)
			.addOptions(roles);
		const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

		const message = ((await channel.messages.fetch()) as Collection<string, Message>).find((message) => {
			const customId = message?.components[0]?.components[0]?.customId;
			return customId === selectMenu.data.custom_id;
		});

		if (message) {
			await message.edit({ components: [component] });
			logger.info(`Roles message updated for guild **${guild.name}**.`);
			continue;
		}

		const embed = new EmbedBuilder()
			.setTitle('Claim your roles!')
			.setDescription('Use the select menu below to `claim` or `revoke` roles.')
			.setFooter({ text: 'Each role grants access to a different text channel.' })
			.setColor('Random');

		await channel.send({ embeds: [embed], components: [component] });
		logger.info(`Roles message sent to channelId **${channelId}** in guild **${guild.name}**.`);
	}
};

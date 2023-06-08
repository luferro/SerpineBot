import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { Collection, Guild, GuildMember, Message, StringSelectMenuBuilder, TextBasedChannel } from 'discord.js';
import { ActionRowBuilder, EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';
import type { ExtendedStringSelectMenuInteraction } from '../types/interaction';

export const data: JobData = { schedule: new Date(Date.now() + 1000 * 60) };

export const execute: JobExecute = async ({ client }) => {
	for (const { 0: guildId, 1: guild } of client.guilds.cache) {
		const settings = await SettingsModel.getSettingsByGuildId({ guildId });
		const channelId = settings?.roles.channelId;
		if (!channelId) continue;

		const channel = await client.channels.fetch(channelId);
		if (!channel?.isTextBased()) continue;

		await createOrUpdateRoleSelectMenuMessage(guild, channel, settings.roles.options ?? []);

		logger.info(`Roles message sent to channelId **${channelId}** in guild **${guild.name}**.`);
	}
};

export const getRoleSelectMenuId = () => 'CLAIM_YOUR_ROLES';

const createRoleSelectMenu = (guild: Guild, options: string[]) => {
	const roles = options
		.map((id) => {
			const role = guild.roles.cache.find(({ id: nestedRoleId }) => nestedRoleId === id);
			if (!role) return;

			return { label: role.name, value: role.id };
		})
		.filter((item): item is NonNullable<typeof item> => !!item);

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId(getRoleSelectMenuId())
		.setPlaceholder('Nothing selected.')
		.setMaxValues(roles.length)
		.addOptions(roles);

	return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
};

const createOrUpdateRoleSelectMenuMessage = async (guild: Guild, channel: TextBasedChannel, options: string[]) => {
	const component = createRoleSelectMenu(guild, options);
	const messages = (await channel.messages.fetch()) as Collection<string, Message>;
	const message = messages.find(
		(message) => message?.components[0]?.components[0]?.customId === getRoleSelectMenuId(),
	);
	if (message) {
		await message.edit({ components: [component] });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle('Text channel roles')
		.setDescription('Use the select menu below to claim or revoke roles.')
		.setFooter({ text: 'Each role grants access to a different text channel.' })
		.setColor('Random');

	await channel.send({ embeds: [embed], components: [component] });
};

const assignRole = (guild: Guild, member: GuildMember, options: string[]) => {
	const granted = [];
	const revoked = [];
	const restricted = [];

	for (const value of options) {
		const role = guild.roles.cache.find(({ id }) => id === value);
		if (!role) continue;

		const restrictionsRole = guild.roles.cache.find(({ name }) => name === 'Restrictions');
		if (restrictionsRole && member.roles.cache.has(restrictionsRole.id)) {
			restricted.push(role.name);
			continue;
		}

		if (!member.roles.cache.has(role.id)) {
			member.roles.add(role);
			granted.push(role.name);
			continue;
		}

		member.roles.remove(role);
		revoked.push(role.name);
	}

	return { granted, revoked, restricted };
};

export const handleRolesUpdate = async (interaction: ExtendedStringSelectMenuInteraction) => {
	const guild = interaction.guild;
	const channel = interaction.channel;
	const member = interaction.member;
	if (member.user.bot || !channel?.isTextBased()) return;

	const { granted, revoked, restricted } = assignRole(guild, member, interaction.values);

	const options = interaction.component.options.map(({ value }) => value);
	await createOrUpdateRoleSelectMenuMessage(guild, channel, options);

	const embed = new EmbedBuilder()
		.setTitle(`${granted.length} role(s) granted and ${revoked.length} role(s) revoked`)
		.addFields([
			{
				name: 'Granted',
				value: granted.join('\n') || 'None',
				inline: true,
			},
			{
				name: 'Revoked',
				value: revoked.join('\n') || 'None',
				inline: true,
			},
			{
				name: 'Restricted',
				value: restricted.join('\n') || 'None',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });

	const { tag } = member.user;
	logger.info(`Roles updated for **${tag}** in **${guild.name}** (+${granted.length} | -${revoked.length}).`);
	logger.debug(JSON.stringify({ granted, revoked, restricted }));
};

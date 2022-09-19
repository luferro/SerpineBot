import type { Bot } from '../structures/bot';
import type { ButtonInteraction, Client, Collection, GuildMember, Message, TextBasedChannel } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { logger } from '@luferro/shared-utils';
import { settingsModel } from '../database/models/settings';
import { JobName } from '../types/enums';

const COMPONENTS_LIMIT = 5;
const ITEMS_PER_ROW = 5;

export const data = {
	name: JobName.Roles,
	schedule: new Date(Date.now() + 1000 * 60),
};

export const execute = async (client: Bot | Client) => {
	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await settingsModel.findOne({ guildId });

		const channelId = settings?.roles.channelId;
		if (!channelId) continue;

		const roles = settings.roles.options
			.map((id) => {
				const messageRole = guild.roles.cache.find(({ id: nestedRoleId }) => nestedRoleId === id);
				if (!messageRole) return;

				return messageRole.name;
			})
			.filter((item): item is NonNullable<typeof item> => !!item);

		const components: ActionRowBuilder<ButtonBuilder>[] = [];
		const rows = Math.ceil(roles.length / ITEMS_PER_ROW);
		for (let index = 0; index < rows; index++) {
			const actionRow = new ActionRowBuilder() as ActionRowBuilder<ButtonBuilder>;
			for (const role of roles.splice(0, ITEMS_PER_ROW)) {
				const button = new ButtonBuilder()
					.setCustomId(role)
					.setLabel(role)
					.setStyle(role === 'NSFW' ? ButtonStyle.Danger : ButtonStyle.Primary);

				actionRow.addComponents(button);
			}
			components.push(actionRow);
		}
		if (components.length > COMPONENTS_LIMIT) continue;

		const message = new EmbedBuilder()
			.setTitle('Text channel roles')
			.setDescription(
				'Use the buttons below to claim or revoke a role.\nEach role grants access to a different text channel.',
			)
			.setColor('Random');

		const channel = await client.channels.fetch(channelId);
		if (!channel?.isTextBased()) continue;

		const messages = (await channel.messages.fetch()) as Collection<string, Message>;
		const rolesMessage = messages.find((message) => message?.embeds[0]?.title === 'Text channel roles');

		if (!rolesMessage) await channel.send({ embeds: [message], components });
		else await rolesMessage.edit({ embeds: [message], components });

		logger.info(`Roles job sent a message to channel **${channelId}** in guild **${guild.name}**.`);

		await handleCollector(channel);
	}
};

const handleCollector = async (channel: TextBasedChannel) => {
	const collector = channel.createMessageComponentCollector({ componentType: ComponentType.Button, max: 1 });
	await new Promise<void>((_resolve, reject) => {
		collector.on('end', async (collected) => {
			try {
				const collectedInteraction = collected.first();
				if (!collectedInteraction) return;

				await assignRole(collectedInteraction);
				await handleCollector(channel);
			} catch (error) {
				reject(error);
			}
		});
	});
};

const assignRole = async (interaction: ButtonInteraction) => {
	const member = interaction.member as GuildMember;
	if (member.user.bot || !interaction.guild?.available) return;

	const role = member.guild.roles.cache.find(({ name }) => name === interaction.customId);
	if (!role) return;

	const restrictionsRole = member.guild.roles.cache.find(({ name }) => name === 'Restrictions');
	if (restrictionsRole && member.roles.cache.has(restrictionsRole.id) && role.name === 'NSFW') {
		await interaction.reply({
			content: "Users with role `Restrictions` can't be granted the NSFW role.",
			ephemeral: true,
		});
		return;
	}

	const hasRole = member.roles.cache.has(role.id);
	if (!hasRole) member.roles.add(role);
	else member.roles.remove(role);

	const action = hasRole ? 'revoked' : 'granted';
	const preposition = hasRole ? 'from' : 'to';

	const embed = new EmbedBuilder().setTitle(`Role ${role.name} has been ${action}.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });

	logger.info(
		`Roles collector **${action}** role **${role.name}** ${preposition} **${member.user.tag}** **${interaction.guild.name}**`,
	);
};

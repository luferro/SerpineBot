import type { JobData } from '../types/bot';
import type { ExtendedButtonInteraction } from '../types/interaction';
import type { Client, Collection, Guild, Message } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { logger } from '@luferro/shared-utils';
import { settingsModel } from '../database/models/settings';
import { JobName } from '../types/enums';

const COMPONENTS_LIMIT = 5;
const ITEMS_PER_ROW = 5;

export const data: JobData = {
	name: JobName.Roles,
	schedule: new Date(Date.now() + 1000 * 60),
};

export const execute = async (client: Client) => {
	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await settingsModel.findOne({ guildId });

		const channelId = settings?.roles.channelId;
		if (!channelId) continue;

		const embed = new EmbedBuilder()
			.setTitle('Text channel roles')
			.setDescription('Use the buttons below to claim or revoke a role.')
			.setFooter({ text: 'A role grants access to a text channel.' })
			.setColor('Random');

		const components = getRoleButtons(guild, settings.roles.options);

		const channel = await client.channels.fetch(channelId);
		if (!channel?.isTextBased()) continue;

		const messages = (await channel.messages.fetch()) as Collection<string, Message>;
		const message = messages.find((message) => message?.embeds[0]?.title === 'Text channel roles');

		if (!message) await channel.send({ embeds: [embed], components });
		else await message.edit({ embeds: [embed], components });

		logger.info(`Job **${data.name}** sent a message to channelId **${channelId}** in guild **${guild.name}**.`);
	}
};

const getRoleButtons = (guild: Guild, options: string[]) => {
	const roles = options
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
			actionRow.addComponents(
				new ButtonBuilder()
					.setCustomId(role)
					.setLabel(role)
					.setStyle(role === 'NSFW' ? ButtonStyle.Danger : ButtonStyle.Primary),
			);
		}
		components.push(actionRow);
	}
	if (components.length > COMPONENTS_LIMIT) throw new Error('Components limit exceeded.');

	return components;
};

export const assignRole = async (interaction: ExtendedButtonInteraction) => {
	const guild = interaction.guild;
	const member = interaction.member;
	if (member.user.bot) return;

	const role = guild.roles.cache.find(({ name }) => name === interaction.customId);
	if (!role) return;

	const restrictionsRole = guild.roles.cache.find(({ name }) => name === 'Restrictions');
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

	logger.info(`Role **${role.name}** **${action}** ${preposition} **${member.user.tag}** in **${guild.name}**`);
};

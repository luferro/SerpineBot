import type { EventData } from '../types/bot';
import type { ExtendedButtonInteraction, ExtendedChatInputCommandInteraction, Interaction } from '../types/interaction';
import { Client, DiscordAPIError, EmbedBuilder } from 'discord.js';
import { FetchError, logger } from '@luferro/shared-utils';
import { Bot } from '../structures/bot';
import { CommandName, EventName } from '../types/enums';
import * as RolesJob from '../jobs/roles';

export const data: EventData = {
	name: EventName.InteractionCreate,
	type: 'on',
};

export const execute = async (_client: Client, interaction: Interaction) => {
	if (interaction.isButton()) await handleButtonInteraction(interaction);
	if (interaction.isChatInputCommand()) await handleChatInputCommandInteraction(interaction);
};

const handleChatInputCommandInteraction = async (interaction: ExtendedChatInputCommandInteraction) => {
	const interactionName = `/${interaction.commandName} ${interaction.options.getSubcommand(false) ?? ''}`.trim();
	const guildName = interaction.guild.name;
	logger.info(`**${interactionName}** used by **${interaction.user.tag}** in guild **${guildName}**.`);

	try {
		if (!interaction.guild.available) throw new Error('Guild is currently unavailable.');

		const command = Bot.commands.get(interaction.commandName as CommandName);
		if (!command) throw new Error('Command does not exist.');

		await command.execute(interaction);
	} catch (error) {
		if (error instanceof DiscordAPIError || error instanceof FetchError) {
			error.message = `Interaction **${interactionName}** in guild ${guildName} failed. Reason: ${error.message}`;
			throw error;
		}

		const embed = new EmbedBuilder()
			.setTitle('Something went wrong.')
			.setDescription((error as Error).message)
			.setColor('Random');

		if (interaction.deferred) await interaction.editReply({ content: null, embeds: [embed], components: [] });
		else await interaction.reply({ embeds: [embed], ephemeral: true });
	}
};

const handleButtonInteraction = async (interaction: ExtendedButtonInteraction) => {
	const isRoleClaimButton = interaction.guild.roles.cache.some(({ name }) => name === interaction.customId);
	if (isRoleClaimButton) RolesJob.assignRole(interaction);
};

import { FetchError, logger } from '@luferro/shared-utils';
import { DiscordAPIError, EmbedBuilder } from 'discord.js';

import * as RolesJob from '../jobs/roles';
import { Bot } from '../structures/Bot';
import type { Args, EventData } from '../types/bot';
import { EventName } from '../types/enums';
import type { ExtendedStringSelectMenuInteraction, Interaction } from '../types/interaction';

export const data: EventData = {
	name: EventName.InteractionCreate,
	type: 'on',
};

export const execute = async (client: Bot, interaction: Interaction) => {
	if (interaction.isStringSelectMenu()) await handleSelectMenuInteraction(interaction);
	if (interaction.isChatInputCommand()) await handleChatInputCommandInteraction({ client, interaction });
};

const handleSelectMenuInteraction = async (interaction: ExtendedStringSelectMenuInteraction) => {
	if (interaction.customId === RolesJob.getRoleSelectMenuId()) RolesJob.handleRolesUpdate(interaction);
};

const handleChatInputCommandInteraction = async ({ client, interaction }: Args) => {
	const command = interaction.commandName;
	const group = interaction.options.getSubcommandGroup(false);
	const subcommand = interaction.options.getSubcommand(false);

	const name = group ? `${command}.${group}.${subcommand}` : subcommand ? `${command}.${subcommand}` : command;
	logger.info(`Command **${name}** used by **${interaction.user.tag}** in guild **${interaction.guild.name}**.`);

	try {
		const execute = Bot.commands.execute.get(name);
		if (!execute) throw new Error(`Slash command "${name}" is not registered.`);
		await execute({ client, interaction });
	} catch (error) {
		if (error instanceof DiscordAPIError || error instanceof FetchError) {
			error.message = `Command **${name}** in guild ${interaction.guild.name} failed. Reason: ${error.message}`;
			throw error;
		}

		const { message } = error as Error;
		const embed = new EmbedBuilder().setTitle('Something went wrong.').setDescription(message).setColor('Random');
		if (interaction.deferred) await interaction.editReply({ content: null, embeds: [embed], components: [] });
		else await interaction.reply({ embeds: [embed], ephemeral: true });
	}
};

import { FetchError, logger } from '@luferro/shared-utils';
import { DiscordAPIError, EmbedBuilder } from 'discord.js';

import { Bot } from '../Bot';
import type { EventData, EventExecute } from '../types/bot';
import type {
	ExtendedChatInputCommandInteraction,
	ExtendedStringSelectMenuInteraction,
	Interaction,
} from '../types/interaction';

type Client = Pick<Parameters<typeof execute>[0], 'client'>;
type Args<T> = [interaction: T];
type ChatInputArgs = Client & { interaction: ExtendedChatInputCommandInteraction };
type StringSelectArgs = Client & { interaction: ExtendedStringSelectMenuInteraction };

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args<Interaction>> = async ({ client, rest: [interaction] }) => {
	if (interaction.isStringSelectMenu()) await handleSelectMenuInteraction({ client, interaction });
	if (interaction.isChatInputCommand()) await handleChatInputCommandInteraction({ client, interaction });
};

const handleSelectMenuInteraction = async ({ client, interaction }: StringSelectArgs) => {
	if (interaction.customId === Bot.ROLES_MESSAGE_ID) client.emit('rolesMessageRoleUpdate', interaction);
};

const handleChatInputCommandInteraction = async ({ client, interaction }: ChatInputArgs) => {
	const command = interaction.commandName;
	const group = interaction.options.getSubcommandGroup(false);
	const subcommand = interaction.options.getSubcommand(false);

	const name = group ? `${command}.${group}.${subcommand}` : subcommand ? `${command}.${subcommand}` : command;
	logger.info(`Command **${name}** used by **${interaction.user.username}** in guild **${interaction.guild.name}**.`);

	try {
		const execute = Bot.commands.interactions.execute.get(name);
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

import { FetchError, logger } from '@luferro/shared-utils';
import { DiscordAPIError, EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import { Bot } from '../Bot';
import type { EventData, EventExecute } from '../types/bot';
import type {
	ExtendedAutocompleteInteraction,
	ExtendedChatInputCommandInteraction,
	ExtendedStringSelectMenuInteraction,
	Interaction,
} from '../types/interaction';

type Client = Pick<Parameters<typeof execute>[0], 'client'>;
type Args<T> = [interaction: T];
type ChatInputArgs = Client & { interaction: ExtendedChatInputCommandInteraction };
type AutocompleteArgs = Client & { interaction: ExtendedAutocompleteInteraction };
type StringSelectArgs = Client & { interaction: ExtendedStringSelectMenuInteraction };

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args<Interaction>> = async ({ client, rest: [interaction] }) => {
	if (interaction.isChatInputCommand()) await handleChatInputCommandInteraction({ client, interaction });
	if (interaction.isAutocomplete()) await handleAutocomplete({ client, interaction });
	if (interaction.isStringSelectMenu()) await handleSelectMenuInteraction({ client, interaction });
};

const extractInteractionMethods = ({
	interaction,
}: Pick<ChatInputArgs, 'interaction'> | Pick<AutocompleteArgs, 'interaction'>) => {
	const { commandName: command, options } = interaction;
	const group = options.getSubcommandGroup(false);
	const subcommand = options.getSubcommand(false);

	const key = group ? `${command}.${group}.${subcommand}` : subcommand ? `${command}.${subcommand}` : command;
	return { key, methods: Bot.commands.interactions.methods.get(key) ?? null };
};

const handleChatInputCommandInteraction = async ({ client, interaction }: ChatInputArgs) => {
	const { key, methods } = extractInteractionMethods({ interaction });
	logger.info(`Command **${key}** used by **${interaction.user.username}** in guild **${interaction.guild.name}**.`);

	try {
		if (!methods) throw new Error(`Slash command "${key}" is not registered.`);
		await methods.execute({ client, interaction });
	} catch (error) {
		const isDiscordAPIError = error instanceof DiscordAPIError;
		const isFetchError = error instanceof FetchError;
		if (isDiscordAPIError || (isFetchError && error.status && error.status >= 500)) {
			error.message = `Command **${key}** in guild ${interaction.guild.name} failed. Reason: ${error.message}`;
			throw error;
		}

		const embed = new EmbedBuilder()
			.setTitle('Something went wrong.')
			.setDescription(error instanceof FetchError ? t(`errors.status.${error.status}`) : (error as Error).message)
			.setColor('Random');

		if (interaction.deferred) await interaction.editReply({ content: null, embeds: [embed], components: [] });
		else await interaction.reply({ embeds: [embed], ephemeral: true });
	}
};

const handleAutocomplete = async ({ client, interaction }: AutocompleteArgs) => {
	const { methods } = extractInteractionMethods({ interaction });
	await methods?.autocomplete?.({ client, interaction });
};

const handleSelectMenuInteraction = async ({ client, interaction }: StringSelectArgs) => {
	if (interaction.customId === Bot.ROLES_MESSAGE_ID) client.emit('rolesMessageRoleUpdate', interaction);
};

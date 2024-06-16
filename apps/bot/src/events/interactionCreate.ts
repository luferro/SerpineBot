import { FetchError } from "@luferro/helpers/fetch";
import { DiscordAPIError, EmbedBuilder } from "discord.js";
import i18next, { t } from "i18next";
import { Bot } from "~/structures/Bot.js";
import type { BaseInteractionArgs, EventData, EventExecute } from "~/types/bot.js";
import type {
	ExtendedAutocompleteInteraction,
	ExtendedChatInputCommandInteraction,
	ExtendedStringSelectMenuInteraction,
	Interaction,
} from "~/types/interaction.js";

type Args<T> = [interaction: T];
type ChatInputArgs = BaseInteractionArgs<ExtendedChatInputCommandInteraction>;
type AutocompleteArgs = BaseInteractionArgs<ExtendedAutocompleteInteraction>;
type StringSelectArgs = BaseInteractionArgs<ExtendedStringSelectMenuInteraction>;

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args<Interaction>> = async ({ client, rest: [interaction] }) => {
	const localization = await client.db.guild.getLocalization({ where: { id: interaction.guild.id } });
	await i18next.changeLanguage(localization.locale);

	if (interaction.isChatInputCommand()) await handleChatInputCommandInteraction({ client, interaction, localization });
	if (interaction.isAutocomplete()) await handleAutocomplete({ client, interaction, localization });
	if (interaction.isStringSelectMenu()) await handleSelectMenuInteraction({ client, interaction, localization });
};

const handleChatInputCommandInteraction = async ({ client, interaction, localization }: ChatInputArgs) => {
	const { key, methods } = extractInteractionMethods(interaction);
	client.logger.info(`Interaction | ${key} invoked by ${interaction.user.username} in ${interaction.guild.name}`);

	try {
		if (!methods) throw new Error(t("errors.interaction.unregistered", { key: `"${key}"` }));
		await methods.execute({ client, interaction, localization });
	} catch (error) {
		const isDiscordAPIError = error instanceof DiscordAPIError;
		const isFetchError = error instanceof FetchError;
		if (isDiscordAPIError || (isFetchError && error.status && error.status >= 500)) {
			error.message = `Interaction | ${key} | ${interaction.guild.name} | Reason: ${error.message}`;
			throw error;
		}

		const embed = new EmbedBuilder()
			.setTitle(t("errors.generic.title"))
			.setDescription(isFetchError ? t(`errors.fetch.status.${error.status}`) : (error as Error).message)
			.setColor("Random");

		if (interaction.deferred) await interaction.editReply({ content: null, embeds: [embed], components: [] });
		else await interaction.reply({ embeds: [embed], ephemeral: true });
	}
};

const handleAutocomplete = async ({ client, interaction, localization }: AutocompleteArgs) => {
	const { methods } = extractInteractionMethods(interaction);
	await methods?.autocomplete?.({ client, interaction, localization });
};

const handleSelectMenuInteraction = async ({ client, interaction }: StringSelectArgs) => {
	if (interaction.customId === Bot.ROLES_MESSAGE_ID) client.emit("userRolesUpdate", interaction);
};

const extractInteractionMethods = (interaction: (ChatInputArgs | AutocompleteArgs)["interaction"]) => {
	const command = interaction.commandName;
	const group = interaction.options.getSubcommandGroup(false);
	const subcommand = interaction.options.getSubcommand(false);

	const key = group ? `${command}.${group}.${subcommand}` : subcommand ? `${command}.${subcommand}` : command;
	return { key, methods: Bot.commands.interactions.methods.get(key) ?? null };
};

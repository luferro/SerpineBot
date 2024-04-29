import path from "node:path";
import { extractPathSegments, getFiles } from "@luferro/helpers/files";
import {
	type ApplicationCommandDataResolvable,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { t } from "i18next";
import { Bot } from "~/structures/Bot.js";
import type { InteractionCommand, MetadataBuilder, VoiceCommand } from "~/types/bot.js";

export const registerCommands = async (client: Bot) => {
	await registerVoiceCommands(client);
	await registerInteractionCommands(client);
};

const registerVoiceCommands = async (client: Bot) => {
	const files = getFiles(path.resolve(import.meta.dirname, "../commands/voice"));
	for (const file of files) {
		const segment = extractPathSegments(file, "voice");
		if (!segment) continue;

		const command: VoiceCommand = await import(file);
		Bot.commands.voice.set(segment, command);
	}
	client.logger.info(`Commands handler | ${files.length} voice command(s) registered`);
};

const registerInteractionCommands = async (client: Bot) => {
	const files = getFiles(path.resolve(import.meta.dirname, "../commands/interactions"));

	const metadata = new Map<string, MetadataBuilder[]>();
	for (const file of files) {
		const segment = extractPathSegments(file, "interactions");
		if (!segment) continue;

		const { data, ...methods }: InteractionCommand = await import(file);
		const options = Array.isArray(data) ? data : [data];

		const keys = segment.split(".");
		if (keys.length > 3) {
			client.logger.warn(`Commands handler | Skipping command ${segment}`);
			continue;
		}

		const metadataKey = [keys[0], ...keys.slice(1, -1)].join(".");
		const storedMetadata = metadata.get(metadataKey);
		if (storedMetadata) storedMetadata.push(...options);
		else metadata.set(metadataKey, options);

		Bot.commands.interactions.methods.set(segment, methods);
	}
	client.logger.info(`Commands handler | ${files.length} interaction command(s) registered`);

	Bot.commands.interactions.metadata.push(...generateSlashCommands(metadata));
	client.logger.info(`Commands handler | ${metadata.size} slash command(s) built`);
};

const generateSlashCommands = (metadata: Map<string, MetadataBuilder[]>) => {
	const getSlashCommandPermission = (key: string) => {
		const permissions: Record<string, bigint> = {
			prune: PermissionFlagsBits.ManageMessages,
			channels: PermissionFlagsBits.ManageChannels,
			webhooks: PermissionFlagsBits.ManageWebhooks,
		};
		return permissions[key] ?? null;
	};

	const builders = new Map<string, SlashCommandBuilder>();
	for (const [key, options] of metadata.entries()) {
		const [command, ...groups] = key.split(".");
		const [group] = groups;

		const builder =
			builders.get(command) ??
			new SlashCommandBuilder()
				.setName(t(`interactions.${command}.name`))
				.setDescription(t(`interactions.${command}.description`))
				.setDefaultMemberPermissions(getSlashCommandPermission(command));

		const attachOptions = (builder: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder) => {
			for (const option of options) {
				if (option instanceof SlashCommandSubcommandBuilder) builder.addSubcommand(option);
				if (builder instanceof SlashCommandSubcommandGroupBuilder) continue;

				if (option instanceof SlashCommandStringOption) builder.addStringOption(option);
				if (option instanceof SlashCommandIntegerOption) builder.addIntegerOption(option);
			}
		};

		if (groups.length > 0) {
			const groupBuilder = new SlashCommandSubcommandGroupBuilder()
				.setName(t(`interactions.${command}.${group}.name`))
				.setDescription(t(`interactions.${command}.${group}.description`));

			attachOptions(groupBuilder);
			builder.addSubcommandGroup(groupBuilder);
		} else attachOptions(builder);

		builders.set(command, builder);
	}
	return builders.values();
};

export const deployCommands = async (client: Bot) => {
	const commands = Bot.commands.interactions.metadata.map((metadata) => metadata.toJSON());
	if (client.config.runtimeEnvironment === "development") await deployGuildCommands(client, commands);
	else await deployGlobalCommands(client, commands);
};

const deployGuildCommands = async (client: Bot, commands: ApplicationCommandDataResolvable[]) => {
	for (const { 1: guild } of client.guilds.cache) {
		const guildCommands = await guild.commands.set(commands);
		if (guildCommands.size === 0) continue;
		client.logger.info(`Commands handler | ${guildCommands.size} slash command(s) deployed in ${guild.name}`);
	}
};

const deployGlobalCommands = async (client: Bot, commands: ApplicationCommandDataResolvable[]) => {
	if (!client.application) throw new Error("Not a client application.");
	const globalCommands = await client.application.commands.set(commands);
	client.logger.info(`Commands handler | ${globalCommands.size} slash command(s) deployed globally`);
};

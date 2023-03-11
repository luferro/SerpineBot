import { IntegrationCategory, MessageCategory } from '@luferro/database';
import { EnumUtil } from '@luferro/shared-utils';
import { randomUUID } from 'crypto';
import type { GuildBasedChannel, TextChannel } from 'discord.js';
import {
	ActionRowBuilder,
	ChannelType,
	ComponentType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';

import * as RolesJob from '../jobs/roles';
import * as Channels from '../services/channels';
import * as Roles from '../services/roles';
import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';

export const data: CommandData = {
	name: CommandName.Channels,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Channels)
		.setDescription('Guild channels commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a guild text/voice channel.')
				.addStringOption((option) => option.setName('name').setDescription('Channel name.').setRequired(true))
				.addIntegerOption((option) =>
					option
						.setName('type')
						.setDescription('Whether it should be a text or voice channel.')
						.setRequired(true)
						.addChoices(
							{ name: 'Text Channel', value: ChannelType.GuildText },
							{ name: 'Voice Channel', value: ChannelType.GuildVoice },
						),
				)
				.addStringOption((option) => option.setName('topic').setDescription('Text channel topic.'))
				.addBooleanOption((option) => option.setName('nsfw').setDescription('NSFW channel toggle.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('update')
				.setDescription('Update a guild channel.')
				.addChannelOption((option) => option.setName('channel').setDescription('Channel.').setRequired(true))
				.addStringOption((option) => option.setName('name').setDescription('Channel name.'))
				.addStringOption((option) => option.setName('topic').setDescription('Text channel topic.'))
				.addBooleanOption((option) => option.setName('nsfw').setDescription('NSFW channel toggle.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a guild channel.')
				.addChannelOption((option) => option.setName('channel').setDescription('Channel.').setRequired(true)),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('assign')
				.setDescription('Assign a bot message to a text channel.')
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: MessageCategory.Roles },
							{ name: 'Birthdays', value: MessageCategory.Birthdays },
							{ name: 'Leaderboards', value: MessageCategory.Leaderboards },
						),
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Text channel to be assigned the message category.')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('unassign')
				.setDescription('Unassign a bot message from a text channel.')
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: MessageCategory.Roles },
							{ name: 'Birthdays', value: MessageCategory.Birthdays },
							{ name: 'Leaderboards', value: MessageCategory.Leaderboards },
						),
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Text channel to be unassigned from the message category.')
						.setRequired(true),
				),
		),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		create: createChannel,
		update: updateChannel,
		delete: deleteChannel,
		assign: assignChannel,
		unassign: unassignChannel,
	};
	await select[subcommand](interaction);
};

const createChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const name = interaction.options.getString('name', true);
	const type = interaction.options.getInteger('type', true) as ChannelType;
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	await Channels.createChannel(interaction.guild, name, type, topic, nsfw);
	const embed = new EmbedBuilder().setTitle(`Channel ${name} has been created.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const updateChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const name = interaction.options.getString('name', true);
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	const isTextOrVoiceChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice;
	if (!isTextOrVoiceChannel) throw new Error('Channel must be a text or voice channel.');

	await Channels.updateChannel(channel, name, topic, nsfw);
	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	const isTextOrVoiceChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice;
	if (!isTextOrVoiceChannel) throw new Error('Channel must be a text or voice channel.');

	await Channels.deleteChannel(channel);
	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const assignChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getInteger('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	if (category === MessageCategory.Birthdays) {
		await Channels.assignChannel(interaction.guild.id, category, channel);
		const embed = new EmbedBuilder().setTitle(`Message has been assigned to ${channel.name}.`).setColor('Random');
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options =
		category === MessageCategory.Roles
			? Roles.getGuildRoles(interaction.guild).map((role) => ({ label: role.name, value: role.id }))
			: EnumUtil.enumKeysToArray(IntegrationCategory).map((option) => ({ label: option, value: option }));
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();
	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	const embed = new EmbedBuilder().setTitle('What should be included in the message?').setColor('Random');
	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });

	await handleChannelSelectMenu(interaction, category, uuid, channel, Channels.assignChannel);
};

const unassignChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getInteger('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	if (category === MessageCategory.Birthdays || category === MessageCategory.Roles) {
		await Channels.unassignChannel(interaction.guild.id, category, channel);

		const embed = new EmbedBuilder().setTitle(`Message unassigned from ${channel.name}.`).setColor('Random');
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options = EnumUtil.enumKeysToArray(IntegrationCategory);
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();
	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options.map((option) => ({ label: option, value: option })));
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	const embed = new EmbedBuilder().setTitle('What should be excluded from the message?').setColor('Random');
	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });

	await handleChannelSelectMenu(interaction, category, uuid, channel, Channels.unassignChannel);
};

const handleChannelSelectMenu = async (
	interaction: ExtendedChatInputCommandInteraction,
	category: MessageCategory,
	uuid: string,
	channel: TextChannel,
	callback: typeof Channels.assignChannel | typeof Channels.unassignChannel,
) => {
	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Channel selection timeout.');

	if (callback instanceof Channels.assignChannel) {
		await callback(interaction.guild.id, category, channel, selectMenuInteraction.values);
	} else {
		await callback(interaction.guild.id, category, channel);
	}

	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');
	await selectMenuInteraction.update({ embeds: [embed], components: [] });

	if (category === MessageCategory.Roles) await RolesJob.execute(selectMenuInteraction.client);
};

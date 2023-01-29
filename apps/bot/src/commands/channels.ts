import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import type { CommandData, CommandExecute } from '../types/bot';
import type { MessageCategory } from '../types/category';
import type { GuildBasedChannel, TextChannel } from 'discord.js';
import {
	ActionRowBuilder,
	EmbedBuilder,
	ChannelType,
	ComponentType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import * as RolesJob from '../jobs/roles';
import * as Channels from '../services/channels';
import * as Roles from '../services/roles';
import * as Leaderboards from '../services/leaderboards';
import { CommandName } from '../types/enums';
import { randomUUID } from 'crypto';

export const data: CommandData = {
	name: CommandName.Channels,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Channels)
		.setDescription('Channels related commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a guild channel.')
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
				.addStringOption((option) => option.setName('topic').setDescription('Topic of the text channel.'))
				.addBooleanOption((option) => option.setName('nsfw').setDescription('Whether the channel is NSFW.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('update')
				.setDescription('Update a guild channel.')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Guild channel.').setRequired(true),
				)
				.addStringOption((option) => option.setName('name').setDescription('Channel name.'))
				.addStringOption((option) => option.setName('topic').setDescription('Topic of the text channel.'))
				.addBooleanOption((option) => option.setName('nsfw').setDescription('Whether the channel is NSFW.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a guild channel.')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Guild channel.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('assign')
				.setDescription('Assign a bot message to a text channel.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: 'Roles' },
							{ name: 'Leaderboards', value: 'Leaderboards' },
							{ name: 'Birthdays', value: 'Birthdays' },
						),
				)
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Text channel to receive bot message.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('dissociate')
				.setDescription('Dissociate a bot message from a text channel.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: 'Roles' },
							{ name: 'Leaderboards', value: 'Leaderboards' },
							{ name: 'Birthdays', value: 'Birthdays' },
						),
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Text channel with the bot message assigned.')
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
		dissociate: dissociateChannel,
	};

	await select[subcommand](interaction);
};

const createChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const name = interaction.options.getString('name', true);
	const type = interaction.options.getInteger('type', true) as ChannelType;
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	await Channels.create(interaction.guild, name, type, topic, nsfw);
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

	await Channels.update(channel, name, topic, nsfw);
	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	const isTextOrVoiceChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice;
	if (!isTextOrVoiceChannel) throw new Error('Channel must be a text or voice channel.');

	await Channels.remove(channel);
	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const handleChannelSelectMenu = async (
	interaction: ExtendedChatInputCommandInteraction,
	uuid: string,
	action: 'assign' | 'dissociate',
	channel: TextChannel,
	category: MessageCategory,
) => {
	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Channel selection timeout.');

	await Channels[action](interaction.guild.id, channel, category, selectMenuInteraction.values);

	const embed = new EmbedBuilder()
		.setTitle(
			action === 'assign'
				? `${channel.name} will now receive ${category} messages.`
				: `${channel.name} will no longer receive ${category} messages.`,
		)
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [embed], components: [] });
	if (category === 'Roles') await RolesJob.execute(selectMenuInteraction.client);
};

const assignChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getString('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	if (category === 'Birthdays') {
		await Channels.assign(interaction.guild.id, channel, category, []);
		const embed = new EmbedBuilder()
			.setTitle(`${category} has been assigned to ${channel.name}.`)
			.setColor('Random');
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options =
		category === 'Roles'
			? Roles.getGuildRoles(interaction.guild).map((role) => ({ label: role.name, value: role.id }))
			: Leaderboards.getLeaderboardCategories().map((option) => ({ label: option, value: option }));
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const embed = new EmbedBuilder()
		.setTitle(`Select which options should be included in the ${category} message.`)
		.setColor('Random');

	const uuid = randomUUID();
	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });
	await handleChannelSelectMenu(interaction, uuid, 'assign', channel, category);
};

const dissociateChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getString('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	if (category === 'Birthdays' || category === 'Roles') {
		await Channels.dissociate(interaction.guild.id, channel, category, []);

		const embed = new EmbedBuilder()
			.setTitle(`${channel.name} will no longer receive ${category} messages.`)
			.setColor('Random');

		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options = Leaderboards.getLeaderboardCategories();
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();
	const channelSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options.map((option) => ({ label: option, value: option })));
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(channelSelectMenu);

	const embed = new EmbedBuilder()
		.setTitle(`Select which options should be excluded from the ${category} message in channel ${channel.name}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });
	await handleChannelSelectMenu(interaction, uuid, 'dissociate', channel, category);
};

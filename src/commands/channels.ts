import {
	ChatInputCommandInteraction,
	Guild,
	ActionRowBuilder,
	SelectMenuBuilder,
	SelectMenuInteraction,
	EmbedBuilder,
	ChannelType,
	GuildBasedChannel,
	ComponentType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import * as RolesJob from '../jobs/roles';
import * as Channels from '../services/channels';
import { CommandName, IntegrationCategory, MessageCategory } from '../types/enums';

export const data = {
	name: CommandName.Channels,
	client: false,
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
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: MessageCategory.Roles },
							{ name: 'Leaderboards', value: MessageCategory.Leaderboards },
							{ name: 'Birthdays', value: MessageCategory.Birthdays },
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
				.addIntegerOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: MessageCategory.Roles },
							{ name: 'Leaderboards', value: MessageCategory.Leaderboards },
							{ name: 'Birthdays', value: MessageCategory.Birthdays },
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

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select = async (category: string) => {
		const options: Record<string, (interaction: ChatInputCommandInteraction) => Promise<void>> = {
			create: createChannel,
			update: updateChannel,
			delete: deleteChannel,
			assign: assignChannel,
			dissociate: dissociateChannel,
		};
		return options[category](interaction);
	};
	await select(subcommand);
};

const createChannel = async (interaction: ChatInputCommandInteraction) => {
	const name = interaction.options.getString('name', true);
	const type = interaction.options.getInteger('type', true) as ChannelType;
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	const guild = interaction.guild as Guild;
	await Channels.create(guild, name, type, topic, nsfw);

	const embed = new EmbedBuilder().setTitle(`Channel ${name} has been created.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const updateChannel = async (interaction: ChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const name = interaction.options.getString('name', true);
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildVoice)
		throw new Error('Channel must be a text or voice channel.');

	await Channels.update(channel, name, topic, nsfw);

	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteChannel = async (interaction: ChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildVoice)
		throw new Error('Channel must be a text or voice channel.');

	await Channels.remove(channel);

	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been deleted.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const getRoleOptions = (guild: Guild) => {
	const roles = [...guild.roles.cache.values()].sort((a, b) => a.position - b.position);
	return roles
		.map(({ id, name, tags }) => {
			if (id === guild.roles.everyone.id || tags) return;

			return {
				label: name,
				value: id,
			};
		})
		.filter((option): option is NonNullable<typeof option> => !!option);
};

const getLeaderboardOptions = () => {
	const leaderboards = Object.keys(IntegrationCategory)
		.filter((element) => !isNaN(Number(element)))
		.map(Number) as IntegrationCategory[];
	return leaderboards.map((option) => ({ label: IntegrationCategory[option], value: IntegrationCategory[option] }));
};

const assignChannel = async (interaction: ChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getInteger('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	const guild = interaction.guild as Guild;
	if (category === MessageCategory.Birthdays) {
		await Channels.assign(guild.id, channel, category, []);

		const embed = new EmbedBuilder()
			.setTitle(`${category} has been assigned to ${channel.name}.`)
			.setColor('Random');

		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options = category === MessageCategory.Roles ? getRoleOptions(guild) : getLeaderboardOptions();
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const selectMenu = new SelectMenuBuilder()
		.setCustomId(`ASSIGN_${category}`)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options);

	const actionRow = new ActionRowBuilder().addComponents(selectMenu) as ActionRowBuilder<SelectMenuBuilder>;

	const embed = new EmbedBuilder()
		.setTitle(`Select which options should be included in the ${MessageCategory[category]} message.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

	const collector = interaction.channel?.createMessageComponentCollector({
		filter: (selectMenuInteraction: SelectMenuInteraction) =>
			selectMenuInteraction.customId === `ASSIGN_${category}` &&
			selectMenuInteraction.user.id === interaction.user.id,
		componentType: ComponentType.SelectMenu,
		max: 1,
		time: 60 * 1000 * 5,
	});
	collector?.on('end', async (collected) => {
		try {
			const collectedInteraction = collected.first();
			if (!collectedInteraction) throw new Error('Channel assign timeout.');

			await Channels.assign(guild.id, channel, category, collectedInteraction.values);

			const embed = new EmbedBuilder()
				.setTitle(`${MessageCategory[category]} messages has been assigned to ${channel.name}.`)
				.setColor('Random');

			collectedInteraction.update({ embeds: [embed], components: [] });

			if (category === MessageCategory.Roles) await RolesJob.execute(collectedInteraction.client);
		} catch (error) {
			await interaction[interaction.replied ? 'editReply' : 'reply']({
				content: (error as Error).message,
				embeds: [],
				components: [],
			});
		}
	});
};

const dissociateChannel = async (interaction: ChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getInteger('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	const guild = interaction.guild as Guild;
	if (category === MessageCategory.Roles || category === MessageCategory.Birthdays) {
		await Channels.dissociate(guild.id, channel, category, []);

		const embed = new EmbedBuilder()
			.setTitle(`${category} has been dissociated from ${channel.name}.`)
			.setColor('Random');

		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const options = getLeaderboardOptions();
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const selectMenu = new SelectMenuBuilder()
		.setCustomId(`DISSOCIATE_${category}`)
		.setPlaceholder('Nothing selected.')
		.setMaxValues(options.length)
		.addOptions(options);

	const actionRow = new ActionRowBuilder().addComponents(selectMenu) as ActionRowBuilder<SelectMenuBuilder>;

	const embed = new EmbedBuilder()
		.setTitle(
			`Select which options should be excluded from the ${MessageCategory[category]} message in channel ${channel.name}.`,
		)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

	const collector = interaction.channel?.createMessageComponentCollector({
		filter: (selectMenuInteraction: SelectMenuInteraction) =>
			selectMenuInteraction.customId === `DISSOCIATE_${category}` &&
			selectMenuInteraction.user.id === interaction.user.id,
		componentType: ComponentType.SelectMenu,
		max: 1,
		time: 60 * 1000 * 5,
	});
	collector?.on('end', async (collected) => {
		try {
			const collectedInteraction = collected.first();
			if (!collectedInteraction) throw new Error('Channel dissociate timeout.');

			await Channels.dissociate(guild.id, channel, category, collectedInteraction.values);

			const embed = new EmbedBuilder()
				.setTitle(`${MessageCategory[category]} message has been dissociated from ${channel.name}.`)
				.setColor('Random');

			await collectedInteraction.update({ embeds: [embed], components: [] });
		} catch (error) {
			await interaction[interaction.replied ? 'editReply' : 'reply']({
				content: (error as Error).message,
				embeds: [],
				components: [],
			});
		}
	});
};

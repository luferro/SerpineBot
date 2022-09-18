import type { ChatInputCommandInteraction, Guild, Role } from 'discord.js';
import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import * as Roles from '../services/roles';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Roles,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Roles)
		.setDescription('Roles related commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a role.')
				.addStringOption((option) => option.setName('name').setDescription('Role name.').setRequired(true))
				.addStringOption((option) => option.setName('color').setDescription('Hexadecimal color.'))
				.addBooleanOption((option) =>
					option
						.setName('hoist')
						.setDescription("Role should or shouldn't appear in a separate category in the users list."),
				)
				.addBooleanOption((option) =>
					option.setName('mentionable').setDescription('Role can be mentioned by anyone.'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('update')
				.setDescription('Update a guild role.')
				.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true))
				.addStringOption((option) => option.setName('name').setDescription('New role name.'))
				.addStringOption((option) => option.setName('color').setDescription('Hexadecimal color.'))
				.addBooleanOption((option) =>
					option
						.setName('hoist')
						.setDescription("Users should or shouldn't appear in a separate category in the users list."),
				)
				.addBooleanOption((option) =>
					option.setName('mentionable').setDescription('Role can be mentioned by anyone.'),
				)
				.addIntegerOption((option) =>
					option.setName('position').setDescription('Role position in the role manager.'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a guild role.')
				.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true)),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('assign')
				.setDescription('Assign a role to a guild member.')
				.addUserOption((option) => option.setName('user').setDescription('Guild user.').setRequired(true))
				.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true)),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('dissociate')
				.setDescription('Dissociate a role from a guild member.')
				.addUserOption((option) => option.setName('user').setDescription('Guild user.').setRequired(true))
				.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true)),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: ChatInputCommandInteraction) => Promise<void>> = {
		create: createRole,
		update: updateRole,
		delete: deleteRole,
		assign: assignRole,
		dissociate: dissociateRole,
	};

	await select[subcommand](interaction);
};

const createRole = async (interaction: ChatInputCommandInteraction) => {
	const name = interaction.options.getString('name', true);
	const color = interaction.options.getString('color') as `#${string}` | null;
	const hoist = interaction.options.getBoolean('hoist');
	const mentionable = interaction.options.getBoolean('mentionable');

	if (color && !/^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)) throw new Error('Invalid hexadecimal color.');

	const guild = interaction.guild as Guild;
	await Roles.create(guild, name, color ?? 'Default', Boolean(hoist), Boolean(mentionable));

	const embed = new EmbedBuilder().setTitle(`Role ${name} has been created.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const updateRole = async (interaction: ChatInputCommandInteraction) => {
	const role = interaction.options.getRole('role', true) as Role;
	const name = interaction.options.getString('name');
	const color = interaction.options.getString('color') as `#${string}` | null;
	const hoist = interaction.options.getBoolean('hoist');
	const mentionable = interaction.options.getBoolean('mentionable');
	const position = interaction.options.getInteger('position');

	if (color && !/^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)) throw new Error('Invalid hexadecimal color.');

	const guild = interaction.guild as Guild;
	await Roles.update(guild, role, name, color, hoist, mentionable, position);

	const embed = new EmbedBuilder().setTitle(`Role ${name} has been updated.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteRole = async (interaction: ChatInputCommandInteraction) => {
	const role = interaction.options.getRole('role', true) as Role;

	await Roles.remove(role);

	const embed = new EmbedBuilder().setTitle(`Role ${role.name} has been deleted.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const assignRole = async (interaction: ChatInputCommandInteraction) => {
	const user = interaction.options.getUser('user', true);
	const role = interaction.options.getRole('role', true) as Role;

	const guild = interaction.guild as Guild;
	await Roles.assign(guild, user.id, role);

	const embed = new EmbedBuilder().setTitle(`Role ${role.name} has been added to ${user.tag}.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const dissociateRole = async (interaction: ChatInputCommandInteraction) => {
	const user = interaction.options.getUser('user', true);
	const role = interaction.options.getRole('role', true) as Role;

	const guild = interaction.guild as Guild;
	await Roles.dissociate(guild, user.id, role);

	const embed = new EmbedBuilder()
		.setTitle(`Role ${role.name} has been removed from ${user.tag}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

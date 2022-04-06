import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, MessageEmbed, Role } from 'discord.js';
import * as Roles from '../services/roles';

export const data = {
    name: 'roles',
    client: false,
    slashCommand: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Roles related commands.')
    .setDefaultPermission(false)
    .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create a role.')
        .addStringOption(option => option.setName('name').setDescription('Role name.').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Hexadecimal color.'))
        .addBooleanOption(option => option.setName('hoist').setDescription('Users should or shouldn\'t appear in a separate category in the users list.'))
        .addBooleanOption(option => option.setName('mentionable').setDescription('Role can be mentioned by anyone.'))
    )
    .addSubcommand(subcommand => subcommand.setName('update').setDescription('Update a guild role.')
        .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('New role name.'))
        .addStringOption(option => option.setName('color').setDescription('Hexadecimal color.'))
        .addBooleanOption(option => option.setName('hoist').setDescription('Users should or shouldn\'t appear in a separate category in the users list.'))
        .addBooleanOption(option => option.setName('mentionable').setDescription('Role can be mentioned by anyone.'))
        .addIntegerOption(option => option.setName('position').setDescription('Role position in the role manager.'))
    )
    .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete a guild role.')
        .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName('assign').setDescription('Assign a role to a guild member.')
        .addUserOption(option => option.setName('user').setDescription('Guild user.').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName('dissociate').setDescription('Dissociate a role from a guild member.')
        .addUserOption(option => option.setName('user').setDescription('Guild user.').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
    )
}

export const execute = async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select: Record<string, Function> = {
        'create': createRole,
        'update': updateRole,
        'delete': deleteRole,
        'assign': assignRole,
        'dissociate': dissociateRole
    };

    await select[subcommand](interaction);
}

const createRole = async (interaction: CommandInteraction) => {
    const name = interaction.options.getString('name')!;
    const color = interaction.options.getString('color') as `#${string}` | null;
    const hoist = interaction.options.getBoolean('hoist');
    const mentionable = interaction.options.getBoolean('mentionable');

    if(color && !/^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)) return await interaction.reply({ content: 'Invalid hexadecimal color.', ephemeral: true });

    const guild = interaction.guild as Guild;
    await Roles.create(guild, name, color ?? 'DEFAULT', Boolean(hoist), Boolean(mentionable));

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${name} has been created.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const updateRole = async (interaction: CommandInteraction) => {
    const role = interaction.options.getRole('role')! as Role;
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color') as `#${string}` | null;
    const hoist = interaction.options.getBoolean('hoist');
    const mentionable = interaction.options.getBoolean('mentionable');
    const position = interaction.options.getInteger('position');

    if(color && !/^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)) return await interaction.reply({ content: 'Invalid hexadecimal color.', ephemeral: true });

    const guild = interaction.guild as Guild;
    await Roles.update(guild, role, name, color, hoist, mentionable, position);
}

const deleteRole = async (interaction: CommandInteraction) => {
    const role = interaction.options.getRole('role')! as Role;

    const { name } = role;
    await Roles.remove(role);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${name} has been deleted.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const assignRole = async (interaction: CommandInteraction) => {
    const user = interaction.options.getUser('user')!;
    const role = interaction.options.getRole('role')! as Role;

    const guild = interaction.guild as Guild;
    const result = await Roles.assign(guild, user.id, role).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${role.name} has been added to ${user.tag}.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const dissociateRole = async (interaction: CommandInteraction) => {
    const user = interaction.options.getUser('user')!;
    const role = interaction.options.getRole('role')! as Role;

    const guild = interaction.guild as Guild;
    const result = await Roles.dissociate(guild, user.id, role).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${role.name} has been removed from ${user.tag}.`)
			.setColor('RANDOM')
	], ephemeral: true });
}
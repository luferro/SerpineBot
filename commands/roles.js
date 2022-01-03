import { MessageEmbed } from 'discord.js';

const manageRoles = async interaction => {
    const subcommand = interaction.options.getSubcommand();

    const executeCommand = type => {
        const options = {
            'create': () => createRole(interaction),
            'update': () => updateRole(interaction),
            'delete': () => deleteRole(interaction),
            'add': () => addRoleToUser(interaction),
            'remove': () => removeRoleFromUser(interaction)
        };
        return options[type]();
    };
    await executeCommand(subcommand);
}

const createRole = async interaction => {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color');
    const hoist = interaction.options.getBoolean('hoist');
    const mentionable = interaction.options.getBoolean('mentionable');

    if(color && !/^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)) return interaction.reply({ content: 'Invalid hexadecimal color.', ephemeral: true });

    await interaction.guild.roles.create({
        name,
        color: color || 'DEFAULT',
        hoist: Boolean(hoist),
        mentionable: Boolean(mentionable),
        position: interaction.guild.roles.cache.size + 1
    });

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${name} has been created.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const updateRole = async interaction => {
    const role = interaction.options.getRole('role');
    if(!role) return interaction.reply({ content: `Role ${role.name} doesn\'t exist.`, ephemeral: true });

    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color');
    const hoist = interaction.options.getBoolean('hoist');
    const mentionable = interaction.options.getBoolean('mentionable');
    const position = interaction.options.getInteger('position');

    if(color && !/^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color)) return interaction.reply({ content: 'Invalid hexadecimal color', ephemeral: true });

    await interaction.guild.roles.edit(role.id, {
        name: name || role.name,
        color: color || role.color,
        hoist: hoist || role.hoist,
        mentionable: mentionable || role.mentionable,
        position: position || role.position
    });

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${role.name} has been updated.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const deleteRole = async interaction => {
    const role = interaction.options.getRole('role');
    if(!role) return interaction.reply({ content: `Role ${role.name} doesn\'t exist.`, ephemeral: true });

    const deletedRole = await role.delete();

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${deletedRole.name} has been deleted.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const addRoleToUser = async interaction => {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    const member = interaction.guild.members.cache.find(item => item.id === user.id);
    if(member.roles.cache.has(role.id)) return interaction.reply({ content: `${user.tag} already has role ${role.name}.`, ephemeral: true });

    member.roles.add(role);

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${role.name} has been added to ${user.tag}.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const removeRoleFromUser = async interaction => {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    const member = interaction.guild.members.cache.find(item => item.id === user.id);
    if(!member.roles.cache.has(role.id)) return interaction.reply({ content: `${user.tag} doesn\'t have role ${role.name}.`, ephemeral: true });

    member.roles.remove(role);

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Role ${role.name} has been removed from ${user.tag}.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

export default { manageRoles };
import type { ColorResolvable, Guild, Role } from 'discord.js';

export const getGuildRoles = (guild: Guild) =>
	[...guild.roles.cache.values()]
		.sort((a, b) => a.position - b.position)
		.filter(({ id }) => id !== guild.roles.everyone.id);

export const createRole = async (
	guild: Guild,
	name: string,
	color: ColorResolvable,
	hoist: boolean,
	mentionable: boolean,
) => {
	return await guild.roles.create({
		name,
		color,
		hoist,
		mentionable,
		position: guild.roles.cache.size + 1,
	});
};

export const updateRole = async (
	guild: Guild,
	role: Role,
	name: string | null,
	color: ColorResolvable | null,
	hoist: boolean | null,
	mentionable: boolean | null,
	position: number | null,
) => {
	return await guild.roles.edit(role.id, {
		name: name ?? role.name,
		color: color ?? role.color,
		hoist: hoist ?? role.hoist,
		mentionable: mentionable ?? role.mentionable,
		position: position ?? role.position,
	});
};

export const deleteRole = async (role: Role) => {
	return await role.delete();
};

export const assignRole = async (guild: Guild, userId: string, role: Role) => {
	const member = guild.members.cache.find(({ id }) => id === userId)!;
	if (member.roles.cache.has(role.id)) throw new Error(`${member.user.tag} already has role ${role.name}.`);

	await member.roles.add(role);
};

export const unassignRole = async (guild: Guild, userId: string, role: Role) => {
	const member = guild.members.cache.find(({ id }) => id === userId)!;
	if (!member.roles.cache.has(role.id)) throw new Error(`${member.user.tag} doesn't have role ${role.name}.`);

	await member.roles.remove(role);
};

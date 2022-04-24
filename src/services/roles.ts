import { ColorResolvable, Guild, Role } from 'discord.js';

export const create = async (
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

export const update = async (
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

export const remove = async (role: Role) => {
	return await role.delete();
};

export const assign = async (guild: Guild, userId: string, role: Role) => {
	const member = guild.members.cache.find(({ id }) => id === userId)!;
	if (member.roles.cache.has(role.id)) throw new Error(`${member.user.tag} already has role ${role.name}.`);

	await member.roles.add(role);
};

export const dissociate = async (guild: Guild, userId: string, role: Role) => {
	const member = guild.members.cache.find(({ id }) => id === userId)!;
	if (!member.roles.cache.has(role.id)) throw new Error(`${member.user.tag} doesn't have role ${role.name}.`);

	await member.roles.remove(role);
};

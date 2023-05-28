import { Action, SettingsModel } from '@luferro/database';
import { Guild, TextChannel } from 'discord.js';

type Args = { category: Action; channel: TextChannel; options: string[] };

export class MessageManager {
	private guild!: Guild;

	withGuild(guild: Guild) {
		this.guild = guild;
		return this;
	}

	async create({ category, channel, options }: Args) {
		await SettingsModel.createGuildMessage(this.guild.id, { category, channelId: channel.id, options });
	}

	async get({ category }: Pick<Args, 'category'>) {
		return await SettingsModel.getGuildMessage(this.guild.id, category);
	}

	async delete({ category, channel }: Pick<Args, 'category' | 'channel'>) {
		const message = await this.get({ category });
		if (message?.channelId !== channel.id) {
			throw new Error(`${Action[category]} message is not assigned to channel ${channel.name}.`);
		}

		await SettingsModel.deleteGuildMessage(this.guild.id, category);
	}
}

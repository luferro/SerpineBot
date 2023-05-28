import { SettingsModel, Webhook } from '@luferro/database';
import { Guild, TextChannel } from 'discord.js';

import { Bot } from '../Bot';

type Args = { category: Webhook; channel: TextChannel };

export class WebhookManager {
	private guild!: Guild;

	constructor(private client: Bot) {}

	withGuild(guild: Guild) {
		this.guild = guild;
		return this;
	}

	async create({ category, channel }: Args) {
		if (category === Webhook.Nsfw && !channel.nsfw) throw new Error('Not a NSFW channel.');

		const webhook = await SettingsModel.getGuildWebhook(this.guild.id, category);
		if (webhook) throw new Error('Webhook has already been assigned to a text channel in this guild.');

		const { id, token, name } = await channel.createWebhook({ name: this.getMapping({ category }) });
		if (!token) throw new Error('No token was provided.');

		await SettingsModel.createGuildWebhook(this.guild.id, { category, id, token, name });
	}

	async get({ category }: Pick<Args, 'category'>) {
		const webhook = await SettingsModel.getGuildWebhook(this.guild.id, category);
		if (!webhook) return null;

		const guildWebhooks = await this.guild.fetchWebhooks();
		if (!guildWebhooks.has(webhook.id)) {
			await SettingsModel.deleteGuildWebhook(this.guild.id, category);
			return null;
		}

		return await this.client.fetchWebhook(webhook.id, webhook.token);
	}

	async delete({ category }: Pick<Args, 'category'>) {
		const webhook = await SettingsModel.getGuildWebhook(this.guild.id, category);
		if (!webhook) throw new Error('Webhook is not assigned to a text channel in this guild.');

		const guildWebhook = await this.get({ category });
		if (!guildWebhook) return;

		await guildWebhook.delete();
		await SettingsModel.deleteGuildWebhook(this.guild.id, category);
	}

	private getMapping({ category }: Pick<Args, 'category'>) {
		const options: Record<typeof category, string> = {
			[Webhook.Nsfw]: 'NSFW',
			[Webhook.Memes]: 'Memes',
			[Webhook.Anime]: 'Anime',
			[Webhook.Manga]: 'Manga',
			[Webhook.WorldNews]: 'World News',
			[Webhook.PortugalNews]: 'Portugal News',
			[Webhook.GamingNews]: 'Gaming News',
			[Webhook.Reviews]: 'Game Reviews',
			[Webhook.Deals]: 'Game Deals',
			[Webhook.FreeGames]: 'Free Games',
			[Webhook.Xbox]: 'Xbox',
			[Webhook.PlayStation]: 'PlayStation',
			[Webhook.Nintendo]: 'Nintendo',
		};
		return options[category];
	}
}

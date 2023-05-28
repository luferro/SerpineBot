import { SettingsModel } from '@luferro/database';

import { Bot } from '../Bot';
import { MessageManager } from './MessageManager';
import { WebhookManager } from './WebhookManager';

export class Settings {
	constructor(private client: Bot) {}

	webhook() {
		return new WebhookManager(this.client);
	}

	message() {
		return new MessageManager();
	}

	async create(guildId: string) {
		await SettingsModel.createGuildSettings(guildId, { messages: [], webhooks: [] });
	}

	async get(guildId: string) {
		return await SettingsModel.getSettingsByGuildId(guildId);
	}

	async delete(guildId: string) {
		await SettingsModel.deleteSettingsByGuildId(guildId);
	}
}

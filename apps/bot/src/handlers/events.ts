import path from "node:path";

import { FsUtil } from "@luferro/shared-utils";

import { Bot } from "../structures/Bot";
import type { Event } from "../types/bot";

export const registerEvents = async (client: Bot) => {
	const files = FsUtil.getFiles(path.resolve(__dirname, "../events"));
	for (const file of files) {
		const event: Event = await import(file);
		const [filename] = path.basename(file).split(".");
		Bot.events.set(filename, event);
	}

	client.logger.info(`Events handler | ${files.length} event(s) registered`);
};

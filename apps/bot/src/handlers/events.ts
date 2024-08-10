import path from "node:path";
import { getFiles } from "@luferro/helpers/files";
import { Bot } from "~/structures/Bot.js";
import type { Event } from "~/types/bot.js";

export const registerEvents = async (client: Bot) => {
	const files = getFiles(path.resolve(import.meta.dirname, "../events"));
	for (const file of files) {
		const event: Event = await import(file);
		const [filename] = path.basename(file).split(".");
		Bot.events.set(filename, event);
	}

	client.logger.info(`Events handler | ${files.length} event(s) registered`);
};

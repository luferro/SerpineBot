import { FetchError } from "@luferro/helpers/fetch";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [error: Error];

export const data: EventData = { listener: "custom", type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [error] }) => {
	const isFetchError = error instanceof FetchError;
	if (!isFetchError) {
		client.logger.error(error);
		return;
	}

	const { url, status, payload } = error;
	client.logger.warn(`Fetch | Request to ${url} failed`);
	client.logger.debug({ url, status, payload });
};

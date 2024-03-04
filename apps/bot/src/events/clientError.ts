import { FetchUtil } from "@luferro/shared-utils";
import type { EventData, EventExecute } from "../types/bot";

type Args = [error: Error];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [error] }) => {
	const isFetchError = error instanceof FetchUtil.FetchError;
	if (!isFetchError) {
		client.logger.error(error);
		return;
	}

	const { url, status, payload } = error;
	client.logger.warn(`Fetch | Request to ${url} failed`);
	client.logger.debug({ url, status, payload });
};

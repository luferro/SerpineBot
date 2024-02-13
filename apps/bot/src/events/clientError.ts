import { FetchUtil } from "@luferro/shared-utils";

import type { EventData, EventExecute } from "../types/bot";

type Args = [error: Error];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [error] }) => {
	if (error instanceof FetchUtil.FetchError) {
		const { url, status, payload } = error;
		client.logger.warn(`Fetch | Request to ${url} failed`);
		client.logger.debug({ url, status, payload });
		return;
	}
	client.logger.error(error);
};

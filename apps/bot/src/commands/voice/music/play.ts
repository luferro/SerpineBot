import { QueryType } from "discord-player";
import { t } from "i18next";

import type { VoiceCommandExecute } from "../../../types/bot";

type Args = [userId: string];

export const execute: VoiceCommandExecute<Args> = async ({ client, queue, slots, rest: [userId] }) => {
	const user = client.users.cache.get(userId);

	const query = slots.query;
	if (!query) throw new Error(t("errors.search.query"));

	const channel = queue.channel;
	if (!channel) throw new Error(t("errors.player.channel"));

	await client.player.play(channel, query, { searchEngine: QueryType.AUTO, requestedBy: user });
};

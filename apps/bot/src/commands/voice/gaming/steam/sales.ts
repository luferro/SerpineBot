import { t } from 'i18next';

import type { VoiceCommandExecute } from '../../../../types/bot';
import { synthesize } from '../../../../utils/speech';

export const execute: VoiceCommandExecute = async ({ client, queue }) => {
	const { sale } = await client.api.gaming.platforms.steam.getUpcomingSales();
	if (!sale) throw new Error(t('errors.search.none'));
	await queue.node.playRaw(await synthesize({ client, text: sale }));
};

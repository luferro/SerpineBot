import type { VoiceCommandExecute } from '../../../../types/bot';
import { synthesize } from '../../../../utils/speech';

export const execute: VoiceCommandExecute = async ({ client, queue }) => {
	const { sale } = await client.api.gaming.steam.getNextSales();
	if (!sale) throw new Error('No dates found for upcoming steam sales');
	await queue.node.playRaw(await synthesize({ client, text: sale }));
};

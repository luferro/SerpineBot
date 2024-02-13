import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue }) => queue.delete();

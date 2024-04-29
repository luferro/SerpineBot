import type { VoiceCommandExecute } from "~/types/bot.js";

export const execute: VoiceCommandExecute = async ({ queue }) => queue.delete();

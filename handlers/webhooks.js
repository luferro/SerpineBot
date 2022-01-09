import anime from '../webhooks/anime.js';
import manga from '../webhooks/manga.js';
import news from '../webhooks/news.js';
import deals from '../webhooks/deals.js';
import reviews from '../webhooks/reviews.js';
import memes from '../webhooks/memes.js';
import xbox from '../webhooks/xbox.js';
import playstation from '../webhooks/playstation.js';
import nintendo from '../webhooks/nintendo.js';
import nsfw from '../webhooks/nsfw.js';
import settingsSchema from '../models/settingsSchema.js';
import stateSchema from '../models/stateSchema.js';

const state = new Map();

export const manageState = (category, entry) => {
    const hasCategory = state.has(category);
    if(!hasCategory) state.set(category, [entry]);

    const entries = state.get(category);
    const hasEntry = entries.some(item => item.url === entry.url);  
    if(!hasEntry) state.set(category, [...entries, entry]);

    return { hasEntry };
}

export const getWebhook = async (client, guild, name) => {
    const settings = await settingsSchema.find({ guild: guild.id });
    const webhooks = settings[0]?.webhooks || [];
    const guildWebhooks = await guild.fetchWebhooks();

    const guildWebhook = webhooks.find(item => item.name === name);
    if(!guildWebhook) return null;

    const hasWebhook = guildWebhooks.has(guildWebhook.id);
    if(!hasWebhook) {
        const webhookIndex = webhooks.findIndex(item => item.name === name);
        webhooks.splice(webhookIndex, 1);
        await settingsSchema.updateOne({ guild: guild.id }, { $set: { webhooks } });

        return null;
    }

    return await client.fetchWebhook(guildWebhook.id, guildWebhook.token);
}

const execute = async client => {
    const promises = await Promise.allSettled([
        news.getNews(client),
        reviews.getReviews(client),
        deals.getDeals(client),
        memes.getMemes(client),
        anime.getAnime(client),
        manga.getManga(client),
        xbox.getXbox(client),
        playstation.getPlaystation(client),
        nintendo.getNintendo(client),
        nsfw.getNSFW(client)
    ]);

    const rejectedPromises = promises.filter(item => item.status === 'rejected');
    for(const rejectedPromise of rejectedPromises) {
        console.log(rejectedPromise.reason);
    }

    for(const [category, entries] of state) {
        const storedState = await stateSchema.find({ category });
        if(storedState[0]?.entries.length === entries.length) continue;

        await stateSchema.updateOne({ category }, { $set: { entries } }, { upsert: true });         
    }
}

export const webhooks = { execute };
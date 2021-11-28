import deals from '../webhooks/deals.js';
import reviews from '../webhooks/reviews.js';
import reddit from '../webhooks/reddit.js';
import xbox from '../webhooks/xbox.js';

const state = new Map();

export const manageState = (category, url) => {
    const hasCategory = state.has(category);
    if(!hasCategory) {
        state.set(category, [url]);
        return { hasCategory, hasEntry: false };
    }

    const items = state.get(category);
    const hasEntry = items.some(item => item === url);  
    if(!hasEntry) items.push(url); 

    return { hasCategory, hasEntry };
}

const execute = async() => {
    await Promise.all([
        reviews.getReviews(),
        deals.getDeals('Sale'),
        deals.getDeals('Free Games'),
        reddit.getReddit('News'),
        reddit.getReddit('Memes'),
        reddit.getReddit('Anime'),
        reddit.getReddit('Manga'),
        reddit.getReddit('Playstation'),
        reddit.getReddit('Nintendo'),
        reddit.getReddit('NSFW'),
        xbox.getXbox('Gamepass'),
        xbox.getXbox('Consoles'),
        xbox.getXbox('Deals')
    ]);
}

export const webhooks = { execute };
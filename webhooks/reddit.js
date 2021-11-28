import { MessageEmbed, WebhookClient } from 'discord.js';
import fetch from 'node-fetch';
import { manageState } from '../handlers/webhooks.js';
import { getChannelType, getSubscribers, getVideoID } from '../utils/youtube.js';

const getReddit = async type => {
    const getCategory = category => {
        const options = {
            'news': { 
                subreddits: ['games'],
                flair: [],
                sort: 'new',
                sendMessage: (...args) => getNews(...args)
            },
            'manga': { 
                subreddits: ['manga'],
                flair: ['DISC'],
                sort: 'new',
                sendMessage: (...args) => getManga(...args)
            },
            'anime': { 
                subreddits: ['anime'],
                flair: ['Episode'],
                sort: 'new',
                sendMessage: (...args) => getAnime(...args)
            },
            'memes': { 
                subreddits: ['memes', 'dankmemes', 'ProgrammerHumor'],
                flair: [],
                sort: 'hot',
                sendMessage: (...args) => getMemes(...args)
            },
            'playstation': { 
                subreddits: ['PS5'],
                flair: ['Articles %26 Blogs', ':ps: Official'],
                sort: 'new',
                sendMessage: (...args) => getPlaystation(...args)
            },
            'nintendo': { 
                subreddits: ['NintendoSwitch'],
                flair: ['News'],
                sort: 'new',
                sendMessage: (...args) => getNintendo(...args)
            },
            'nsfw': { 
                subreddits: ['boobs', 'gonewild', 'RealGirls', 'BiggerThanYouThought', 'TittyDrop', 'BreedingMaterial'],
                flair: [],
                sort: 'hot',
                sendMessage: (...args) => getNSFW(...args)
            }
        };
        return options[category];
    };
    const category = getCategory(type.toLowerCase());

    for(const subreddit of category.subreddits) {
        const flair = category.flair.length > 0 ? category.flair.map(item => `flair_name:"${item}"`).join(' OR ') : null;

        const res = await fetch(!flair ? `https://www.reddit.com/r/${subreddit}/${category.sort}.json` : `https://www.reddit.com/r/${subreddit}/search.json?q=${flair}&restrict_sr=1&sort=${category.sort}`);
        if(!res.ok) continue;
        const data = await res.json();
        if(data.data.children.length === 0) continue;

        const filteredData = data.data.children.filter(item => !item.data.stickied && !item.data.is_video && !item.data.removed_by_category).sort((a, b) => b.data.created_utc - a.data.created_utc);

        const title = filteredData[0].data.title;
        const link = filteredData[0].data.url;
        const permalink = filteredData[0].data.permalink;
	    const selftext = filteredData[0].data.selftext.split('\n');
        const hasMedia = filteredData[0].data.secure_media;
        const isNSFW = Boolean(filteredData[0].data.whitelist_status === 'promo_adult_nsfw');

        await category.sendMessage(subreddit, title, link, permalink, selftext, hasMedia, isNSFW);
    }
}

const getNews = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const getURL = (isVideo, isTweet) => {
        if(isVideo) return `https://www.youtube.com/watch?v=${getVideoID(link)}`;
        if(isTweet) return link.split('?')[0];
        if(link.includes('/r/')) return `https://www.reddit.com${link}`;
        return link;
    }

    const webhook = new WebhookClient({ url: process.env.WEBHOOK_NEWS });
    const news = title.length > 256 ? `${title.slice(0 , 253)}...` : title;

	const isVideo = hasMedia && hasMedia.type === 'youtube.com';
	const isTweet = hasMedia && hasMedia.type === 'twitter.com';
    const url = getURL(isVideo, isTweet);

	const channelType = hasMedia && getChannelType(hasMedia.oembed.author_url);
	const channel = hasMedia && hasMedia.oembed.author_url?.split(`/${channelType}/`)[1];
	const subscribers = isVideo && await getSubscribers(channel, channelType, url);
    if(typeof subscribers === 'number' && subscribers < 50000) return;

    const state = manageState(category, url);
    if(!state.hasCategory || state.hasEntry) return;

    const isInvalid = ['review', 'https://www.reddit.com/r/Games'].some(item => link.includes(item));
    if(isInvalid) return;

    if(hasMedia) return webhook.send({ content: `**${news}**\n${url}` });

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(news)
            .setURL(url)
            .setColor('RANDOM')
    ]});
}

const getMemes = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const webhook = new WebhookClient({ url: process.env.WEBHOOK_MEMES });
    const meme = title.length > 256 ? `${title.slice(0, 253)}...` : title;

    const state = manageState(category, link);
    if(!state.hasCategory || state.hasEntry) return;

    const hasVideoExtension = ['gif', 'gifv', 'mp4'].some(item => link.includes(item));
    if(hasVideoExtension) return webhook.send({ content: `**[${meme}](<https://www.reddit.com${permalink}>)**\n${link}` });

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(meme)
            .setURL(`https://www.reddit.com${permalink}`)
            .setImage(link)
            .setColor('RANDOM')
    ]});
}

const getAnime = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const getAnimeDetails = async id => {
        if(!id) return { episodesCount: 'N/A', score: 'N/A', image: 'N/A' };
    
        const res = await fetch(`https://api.jikan.moe/v3/anime/${id}`);
        const data = await res.json();
    
        const lastDotImage = data.image_url?.lastIndexOf('.');
        const image = lastDotImage && `${data.image_url.substring(0, lastDotImage)}l.${data.image_url.substring(lastDotImage + 1)}`
    
        return { episodesCount: data.episodes, score: data.score, image };
    }

    const animeAggregators = [
        { name: 'MyAnimeList', url: '//myanimelist.net/anime/' }, 
        { name: 'AniList', url: '//anilist.co/anime/' }, 
        { name: 'Anime-Planet', url: '//www.anime-planet.com/anime/' }
    ];
    
    const animeStreams = [
        { name: 'Crunchyroll', url: '//www.crunchyroll.com/' },
        { name: 'Crunchyroll', url: '//crunchyroll.com/' },
        { name: 'AnimeLab', url: '//www.animelab.com/shows/' },
        { name: 'Funimation', url: '//www.funimation.com/shows/' },
        { name: 'VRV', url: '//vrv.co/series/' },
        { name: 'HIDIVE', url: '//www.hidive.com/tv/' },
        { name: 'Netflix', url: '//www.netflix.com/title/' }
    ];

    const webhook = new WebhookClient({ url: process.env.WEBHOOK_ANIME });
    const anime = title.replace(/Discussion|discussion/, '').trim();

    const animeStreamsInfo = animeStreams.map(item => {
        const stream = selftext.find(nestedItem => nestedItem.includes(item.url));
        return stream && `> **[${item.name}](${stream.match(/(?<=\()(.*)(?=\))/g)[0]})**`;
    }).filter(Boolean)

	const animeAggregatorsInfo = animeAggregators.map(item => {
        const aggregator = selftext.find(nestedItem => nestedItem.includes(item.url));
        return aggregator && `> **[${item.name}](${aggregator.match(/(?<=\()(.*)(?=\))/g)[0]})**`;
    }).filter(Boolean)
	
    const aggregator = animeAggregatorsInfo.find(item => item.includes(animeAggregators[0].url));
    const anime_id = aggregator.match(/\((.*?)\)/g)[0].match(/\d+/g)[0];
	const { episodesCount, score, image } = await getAnimeDetails(anime_id);

    const state = manageState(category, link);
    if(!state.hasCategory || state.hasEntry) return;

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(anime)
            .setURL(link)
            .setThumbnail(image)
            .addField('**Streams**', animeStreamsInfo.length > 0 ? animeStreamsInfo.join('\n') : 'N/A')
            .addField('**Anime Information**', animeAggregatorsInfo.length > 0 ? animeAggregatorsInfo.join('\n') : 'N/A')
            .addField('**Total episodes**', episodesCount ? episodesCount.toString() : 'N/A', true)
            .addField('**Score**', score ? score.toString() : 'N/A', true)
            .setColor('RANDOM')
    ]});
}

const getManga = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const webhook = new WebhookClient({ url: process.env.WEBHOOK_MANGA });
    const manga = title.replace('[DISC]', '').trim();
    const url = link.includes('/r/') ? `https://www.reddit.com${link}` : link;

    const state = manageState(category, manga);
    if(!state.hasCategory || state.hasEntry) return;

    const isInvalid = ['https://www.reddit.com/r/manga'].some(item => link.includes(item) || isNSFW);
    if(isInvalid) return;

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(manga)
            .setURL(url)
            .setColor('RANDOM')
    ]});
}

const getPlaystation = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const webhook = new WebhookClient({ url: process.env.WEBHOOK_PLAYSTATION });
    const url = link.includes('/r/') ? `https://www.reddit.com${link}` : link;

    const state = manageState(category, url);
    if(!state.hasCategory || state.hasEntry) return;

    const isInvalid = ['https://www.reddit.com/r/PS5'].some(item => link.includes(item));
    if(isInvalid) return;

    if(hasMedia) return webhook.send({ content: `**${title}**\n${url}` });

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(url)
            .setColor('RANDOM')
    ]});
}

const getNintendo = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const webhook = new WebhookClient({ url: process.env.WEBHOOK_NINTENDO });
    const url = link.includes('/r/') ? `https://www.reddit.com${link}` : link;

    const state = manageState(category, url);
    if(!state.hasCategory || state.hasEntry) return;

    const isInvalid = ['https://www.reddit.com/r/NintendoSwitch'].some(item => link.includes(item));
    if(isInvalid) return;

    if(hasMedia) return webhook.send({ content: `**${title}**\n${url}` });

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(url)
            .setColor('RANDOM')
    ]});
}

const getNSFW = async(category, title, link, permalink, selftext, hasMedia, isNSFW) => {
    const webhook = new WebhookClient({ url: process.env.WEBHOOK_NSFW });
    const url = hasMedia?.oembed.thumbnail_url.replace(hasMedia.oembed.thumbnail_url.split('-')[1], 'mobile.mp4') || link;

    const state = manageState(category, url);
    if(!state.hasCategory || state.hasEntry) return;

    const isInvalid = ['?play', 'https://www.reddit.com/gallery'].some(item => link.includes(item));
    if(isInvalid) return;

    const hasVideoExtension = ['gif', 'gifv', 'mp4'].some(item => link.includes(item));
    if(hasMedia || hasVideoExtension) return webhook.send({ content: `**[${title}](<https://www.reddit.com${permalink}>)**\n${url}` });

    webhook.send({ embeds: [
        new MessageEmbed()
            .setTitle(title)
            .setURL(`https://www.reddit.com${permalink}`)
            .setImage(url)
            .setColor('RANDOM')
    ]});
}

export default { getReddit };
import fetch from 'node-fetch';

const getVideoID = url => {
    const newURL = url.includes('embed') ? url.split('/')[4] : url.split('/')[3];
    return newURL.match(/([A-z0-9_.\-~]{11})/g)[0];
}

const getChannelType = url => {
    if(url.includes('channel')) return 'channel';
    if(url.includes('user')) return 'user';
    return 'custom';
}

const getChannelID = async url => {
    const videoID = getVideoID(url);

    const res = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${process.env.YOUTUBE_API_KEY}`);
    const data = await res.json();

    return data.items[0].snippet.channelId;
}

const getSubscribers = async(channel, type, url) => {        
    const option = type === 'channel' || type === 'custom' ? 'id' : 'forUsername';
    const channelID = type === 'custom' ? await getChannelID(url) : channel;

    const res = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=statistics&${option}=${channelID}&key=${process.env.YOUTUBE_API_KEY}`);
    const data = await res.json();

    const subscriberCount = data.items?.length > 0 ? parseInt(data.items[0].statistics.subscriberCount) : 0;
    return !isNaN(subscriberCount) ? subscriberCount : 0;
}

export { getVideoID, getChannelType, getSubscribers };
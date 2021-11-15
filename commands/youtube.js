import youtubei from 'youtubei';
import { erase } from '../utils/message.js';
const youtube = new youtubei.Client();

const getYoutubeURL = async(message, args) => {
    erase(message, 5000);

    const query = args.slice(1).join(' ');
    if(!query) return message.channel.send({ content: './cmd youtube' });

    const results = await youtube.search(query);

    message.channel.send({ content: `https://www.youtube.com/watch?v=${results[0].id}` });
}

export default { getYoutubeURL };
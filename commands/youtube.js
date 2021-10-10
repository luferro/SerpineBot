const { Client } = require('youtubei');
const { erase } = require('../utils/message');
const youtube = new Client();

module.exports = {
    name: 'youtube',
    async getYoutubeURL(message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ');
        if(!query) return message.channel.send('./cmd youtube');

        const results = await youtube.search(query);

        message.channel.send(`https://www.youtube.com/watch?v=${results[0].id}`);
    }
}
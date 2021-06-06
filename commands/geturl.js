const { Client } = require('youtubei');
const youtube = new Client();

module.exports = {
    name: 'geturl',
    async getURL(message, args) {        
        message.delete({ timeout: 5000 });

        try {
            const query = args.slice(1).join(' ');
            const results = await youtube.search(query);

            message.reply(`${results[0].title}\nhttps://www.youtube.com/watch?v=${results[0].id}`);
        } catch (error) {
            console.log(error);
        }
    }
}
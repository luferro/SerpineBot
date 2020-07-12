const scrapeYt = require("scrape-yt");

module.exports = {
    name: 'searchyt',
    async execute(message, args){        
        message.delete({ timeout: 5000 });
        
        let argssearch = args.slice(1).join(" ");

        let results = await scrapeYt.search(argssearch);

        return message.reply(results[0].title + "\nhttps://www.youtube.com/watch?v="+results[0].id);
    }
}
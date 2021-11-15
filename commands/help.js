import { MessageEmbed } from 'discord.js';
import { erase } from '../utils/message.js';

const getHelp = (message, args) => {
    erase(message, 5000);

    const random = Math.floor(Math.random() * 16777214) + 1;
    switch (args[1]) {
        case 'aww':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Aww')
                        .addField('`./aww`', 'Returns a random cute picture.')
                        .setFooter('Powered by Reddit.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'comics':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Comics')
                        .addField('`./comics cyanide and happiness`', 'Returns a Cyanide and Happiness comic.')
                        .addField('`./comics garfield`', 'Returns a Garfield comic.')
                        .addField('`./comics fowl language`', 'Returns a Fowl Language comic.')
                        .addField('`./comics sarahs scribbles`', 'Returns a Sarah\'s Scribbles comic.')
                        .addField('`./comics peanuts`', 'Returns a Peanuts comic.')
                        .addField('`./comics calvin and hobbes`', 'Returns a Calvin and Hobbes comic.')
                        .addField('`./comics get fuzzy`', 'Returns a Get Fuzzy comic.')
                        .addField('`./comics jake likes onions`', 'Returns a Jake Likes Onions comic.')
                        .setFooter('Powered by Explosm and GoComics.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'deals':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Deals')
                        .addField('`./deals <Game title>`', 'Returns the best deals (official stores and keyshops) for a given PC game.')
                        .setFooter('Powered by gg.deals.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'del':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Delete')
                        .addField('`./del <Quantity of messages>`', 'Allows you to delete messages in bulk. Maximum quantity of 100 messages in one go.')
                        .addField('`./del <option: after or before> <Bot message ID>`', 'Allows you to delete SerpineBot messages after or before a given message ID.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'games':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Games')
                        .addField('`./games <Game title>`', 'Returns a general overview of a given game.')
                        .setFooter('Powered by Rawg and HowLongToBeat.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'hltb':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('HowLongToBeat')
                        .addField('`./hltb <Game title>`', 'Returns an average playtime needed to beat a given game.')
                        .setFooter('Powered by HowLongToBeat.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'jokes':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Jokes')
                        .addField('`./jokes prog`', 'Returns a programming joke.')
                        .addField('`./jokes misc`', 'Returns a miscellaneous joke.')
                        .addField('`./jokes dark`', 'Returns a dark joke.')
                        .addField('`./jokes dad`', 'Returns a dad joke.')
                        .addField('`./jokes yo momma`', 'Returns a yo momma joke.')
                        .setFooter('Powered by JokeAPI and icanhazdadjokeAPI.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'memes':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Memes')
                        .addField('`./memes`', 'Returns a random meme.')
                        .setFooter('Powered by Reddit.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'movies':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Movies')
                        .addField('`./movies <Movie title>`', 'Returns an overview of a given movie.')
                        .setFooter('Powered by TheMovieDB and JustWatch.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'music':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Music')
                        .addField('`./join`', 'Bot joins the voice channel you\'re in.')
                        .addField('`./play <Youtube query>`', 'Plays the first result matching your search query.')
                        .addField('`./pause', 'Pauses the current item playing.')
                        .addField('`./pause', 'Resumes paused item.')
                        .addField('`./loop`', 'Sets the current item on loop.')
                        .addField('`./volume <0-100>`', 'Sets the volume of the bot.')
                        .addField('`./skip`', 'Skips the current item.')
                        .addField('`./queue`', 'Shows you the current queue.')
                        .addField('`./remove <Index to remove>`', 'Removes a given item from the queue.')
                        .addField('`./clear`', 'Removes every item in the queue.')
                        .addField('`./leave`', 'Bot leaves the voice channel.')
                        .setFooter('Powered by Youtubei.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'poll':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Poll')
                        .addField('`./poll <question - question mark is mandatory> <optional: item 1, item 2, item 3, etc>`', 'Creates a poll with reactions.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'reminder':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Reminders')
                        .addField('`./reminder <time> <message>`', 'Sets a reminder for a given message.')
                        .addField('`./reminder delete <reminder ID>`', 'Deletes a reminder matching reminderID.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'reviews':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Reviews')
                        .addField('`./reviews <Game title>`', 'Returns reviews for a given game.')
                        .setFooter('Powered by OpenCritic.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'secretsanta':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Secret Santa')
                        .addField('`./secretsanta @user1 @user2 @user3`', 'Organizes a secret santa with mentioned users.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'specs':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Specs')
                        .addField('`./specs <Game title>`', 'Returns the minimum and recommended system requirements of a given game.')
                        .setFooter('Powered by Game-Debate.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'steam':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Steam')
                        .addField('`./steam sale`', 'Returns the next steam sale.')
                        .addField('`./steam top played`', 'Returns Steam\'s top played games.')
                        .addField('`./steam top sellers`', 'Returns Steam\'s top sellers.')
                        .addField('`./steam upcoming`', 'Returns Steam\'s upcoming games.')
                        .addField('`./steam historical <Game title>`', 'Returns Steam\'s historical lows for a given game.')
                        .addField('`./steam import <Steam profile URL>`', 'Integrate Steam with the bot.')
                        .addField('`./steam sync`', 'Manually synchronize your Steam integration.')
                        .addField('`./steam profile`', 'Returns your Steam profile.')
                        .addField('`./steam profile <Mention>`', 'Returns the mentioned user\'s Steam profile.')
                        .addField('`./steam wishlist`', 'Returns your Steam wishlist.')
                        .addField('`./steam wishlist <Mention>`', 'Returns the mentioned user\'s Steam wishlist.')
                        .addField('`./steam leaderboard`', 'Returns the Steam leaderboard for the week.')
                        .addField('`./steam delete`', 'Delete Steam integration.')
                        .setFooter('Powered by Steam, PrepareYourWallet and IsThereAnyDeal.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'tv':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('TV')
                        .addField('`./tv <TV Show title>`', 'Returns an overview of a given TV show.')
                        .setFooter('Powered by TheMovieDB and JustWatch.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        case 'youtube':
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Youtube')
                        .addField('`./youtube <Youtube query>`', 'Returns a the Youtube URL that matches your search query.')
                        .setFooter('Powered by Youtubei.')
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
        default:
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Commands help')
                        .addField('**Me**', '**[Luís Ferro](https://github.com/xSerpine)**', true)
                        .addField('**Repository**', '**[Serpine Bot](https://github.com/xSerpine/SerpineBot)**', true)
                        .addField('**Prefixes**', '`.<command>` `/<command>` `./<command>` `$<command>` `!<command>`')
                        .addField('**Comics**', '`./cmd comics`', true)
                        .addField('**Cute**', '`./cmd aww`', true)
                        .addField('**Deals**', '`./cmd deals`', true)
                        .addField('**Delete**', '`./cmd del`', true)
                        .addField('**Games**', '`./cmd games`', true)
                        .addField('**HowLongToBeat**', '`./cmd hltb`', true)
                        .addField('**Jokes**', '`./cmd jokes`', true)
                        .addField('**Memes**', '`./cmd memes`', true)
                        .addField('**Movies**', '`./cmd movies`', true)
                        .addField('**Music**', '`./cmd music`', true)
                        .addField('**Poll**', '`./cmd poll`', true)
                        .addField('**Reminder**', '`./cmd reminder`', true)
                        .addField('**Reviews**', '`./cmd reviews`', true)
                        .addField('**Secret Santa**', '`./cmd secretsanta`', true)
                        .addField('**Specs**', '`./cmd specs`', true)
                        .addField('**Steam**', '`./cmd steam`', true)
                        .addField('**TV Shows**', '`./cmd tv`', true)
                        .addField('**Youtube Search**', '`./cmd youtube`', true)
                        .setColor(random)
                ]
            }).then(m => erase(m, 1000 * 60));
    }
}

export default { getHelp };
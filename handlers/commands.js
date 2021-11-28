import { SlashCommandBuilder } from '@discordjs/builders';
import comics from '../commands/comics.js';
import deals from '../commands/deals.js';
import prune from '../commands/prune.js';
import games from '../commands/games.js';
import howlongtobeat from '../commands/howlongtobeat.js';
import jokes from '../commands/jokes.js';
import movies from '../commands/movies.js';
import music from '../commands/music.js';
import poll from '../commands/poll.js';
import reddit from '../commands/reddit.js';
import reminder from '../commands/reminder.js';
import reviews from '../commands/reviews.js';
import secretsanta from '../commands/secretsanta.js';
import steam from '../commands/steam.js';
import specs from '../commands/specs.js';
import tv from '../commands/tv.js';
import youtube from '../commands/youtube.js';

const createSlashCommands = client => {
    const commands = [
        new SlashCommandBuilder()
            .setName('delete')
            .setDescription('Delete messages from any user. Maximum of 100 messages and can\'t be older than 2 weeks.')
            .addIntegerOption(option => option.setName('quantity').setDescription('Quantity of messages to delete.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('poll')
            .setDescription('Creates a poll with reactions.')
            .addStringOption(option => option.setName('question').setDescription('Poll question.').setRequired(true))
            .addStringOption(option => option.setName('options').setDescription('Poll options. Options must be separated by a delimiter.')),
        new SlashCommandBuilder()
            .setName('youtube')
            .setDescription('Returns a the Youtube URL that matches your search query.')
            .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('reminder')
            .setDescription('Reminder related commands.')
            .addSubcommand(subcommand => subcommand.setName('create').setDescription('Creates a reminder.')
                .addIntegerOption(option => option.setName('time').setDescription('In how much time you want to be reminded of your message.').setRequired(true))
                .addStringOption(option => option.setName('unit').setDescription('Time unit.').setRequired(true).addChoices([['Seconds', 'secs'], ['Minutes', 'mins'], ['Hours', 'hours'], ['Days', 'days'], ['Weeks', 'weeks'], ['Months', 'months'], ['Years', 'years']]))
                .addStringOption(option => option.setName('message').setDescription('Message you want to be reminded of.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete a reminder.').addStringOption(option => option.setName('reminder').setDescription('ID of the reminder to be deleted.').setRequired(true))),
        new SlashCommandBuilder()
            .setName('secretsanta')
            .setDescription('Organizes a secret santa with mentioned users.')
            .addStringOption(option => option.setName('mentions').setDescription('Mention users participating in this Secret Santa.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('steam')
            .setDescription('Steam related commands.')
            .addSubcommand(subcommand => subcommand.setName('sale').setDescription('Returns the next steam sale.'))
            .addSubcommand(subcommand => subcommand.setName('top').setDescription('Returns Steam\'s top played games.'))
            .addSubcommand(subcommand => subcommand.setName('hot').setDescription('Returns Steam\'s top sellers.'))
            .addSubcommand(subcommand => subcommand.setName('new').setDescription('Returns Steam\'s upcoming games.'))
            .addSubcommand(subcommand => subcommand.setName('leaderboard').setDescription('Returns the Steam leaderboard for the week.'))
            .addSubcommand(subcommand => subcommand.setName('sync').setDescription('Manually synchronize your Steam integration.'))
            .addSubcommand(subcommand => subcommand.setName('profile').setDescription('Returns the Steam profile for your account/mentioned user.').addMentionableOption(option => option.setName('mention').setDescription('User mention.')))
            .addSubcommand(subcommand => subcommand.setName('wishlist').setDescription('Returns the Steam wishlist for your account/mentioned user.').addMentionableOption(option => option.setName('mention').setDescription('User mention.')))
            .addSubcommand(subcommand => subcommand.setName('import').setDescription('Integrate your Steam profile with the bot.').addStringOption(option => option.setName('url').setDescription('Steam profile URL.').setRequired(true)))
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete your Steam profile integration with the bot.')),
        new SlashCommandBuilder()
            .setName('deals')
            .setDescription('Returns the best deals (official stores and keyshops) for a given PC game.')
            .addStringOption(option => option.setName('game').setDescription('Game title').setRequired(true)),
        new SlashCommandBuilder()
            .setName('games')
            .setDescription('Returns a general overview of a given game.')
            .addStringOption(option => option.setName('game').setDescription('Game title.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('movies')
            .setDescription('Returns an overview of a given movie.')
            .addStringOption(option => option.setName('movie').setDescription('Movie title.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('hltb')
            .setDescription('Returns an average playtime needed to beat a given game.')
            .addStringOption(option => option.setName('game').setDescription('Game title.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('reviews')
            .setDescription('Returns reviews for a given game.')
            .addStringOption(option => option.setName('game').setDescription('Game title.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('specs')
            .setDescription('Returns the minimum and recommended system requirements of a given game.')
            .addStringOption(option => option.setName('game').setDescription('Game title.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('tv')
            .setDescription('Returns an overview of a given TV series.')
            .addStringOption(option => option.setName('series').setDescription('TV series title.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('comics')
            .setDescription('Returns a random page from a given comic.')
            .addIntegerOption(option => option.setName('category').setDescription('Comic category.').setRequired(true).addChoices([['Cyanide and Happiness', 1], ['Garfield', 2], ['Peanuts', 3], ['Get Fuzzy', 4], ['Fowl Language', 5], ['Calvin and Hobbes', 6], ['Jake Likes Onions', 7], ['Sarah\'s Scribbles', 8]])),
        new SlashCommandBuilder()
            .setName('jokes')
            .setDescription('Returns a joke from a given category.')
            .addIntegerOption(option => option.setName('category').setDescription('Joke category.').setRequired(true).addChoices([['Dark Joke', 1], ['Programming Joke', 2], ['Miscellaneous Joke', 3]])),
        new SlashCommandBuilder()
            .setName('reddit')
            .setDescription('Returns a random reddit post from a given category.')
            .addIntegerOption(option => option.setName('category').setDescription('Reddit category.').setRequired(true).addChoices([['Aww', 1], ['Memes', 2]])),
        new SlashCommandBuilder()
            .setName('join')
            .setDescription('Bot joins the voice channel you\'re in.'),
        new SlashCommandBuilder()
            .setName('play')
            .setDescription('Plays the first result matching your search query.')
            .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('pause')
            .setDescription('Pauses the current item playing.'),
        new SlashCommandBuilder()
            .setName('resume')
            .setDescription('Resumes paused item.'),
        new SlashCommandBuilder()
            .setName('loop')
            .setDescription('Sets the current item in loop.'),
        new SlashCommandBuilder()
            .setName('volume')
            .setDescription('Sets the volume of the player.')
            .addIntegerOption(option => option.setName('volume').setDescription('Volume <0-100>.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('skip')
            .setDescription('Skips the current item playing.'),
        new SlashCommandBuilder()
            .setName('queue')
            .setDescription('Lists the current queue.'),
        new SlashCommandBuilder()
            .setName('remove')
            .setDescription('Removes an item from the queue matching a given position.')
            .addIntegerOption(option => option.setName('index').setDescription('Position in the queue of the item you wish to remove.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Removes every item in the queue.'),
        new SlashCommandBuilder()
            .setName('leave')
            .setDescription('Bot leaves the voice channel.'),
        new SlashCommandBuilder()
            .setName('search')
            .setDescription('Search the top 10 results for a given query.')
            .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true))
    ].map(command => command.toJSON());

    client.guilds.cache.get('223461927311900674').commands.set(commands);
}

export const commands = { createSlashCommands, comics, deals, prune, games, howlongtobeat, jokes, movies, music, poll, reddit, reminder, reviews, secretsanta, specs, steam, tv, youtube };
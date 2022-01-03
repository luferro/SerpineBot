import { Permissions } from 'discord.js';
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
import integrations from '../commands/integrations.js';
import webhooks from '../commands/webhooks.js';
import channels from '../commands/channels.js';
import roles from '../commands/roles.js';

const createSlashCommands = async client => {
    const commands = [
        new SlashCommandBuilder()
            .setName('roles')
            .setDescription('Manage guild roles.')
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Add a guild role to guild member.')
                .addUserOption(option => option.setName('user').setDescription('Guild user.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Remove a guild role from guild member.')
                .addUserOption(option => option.setName('user').setDescription('Guild user.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Create a guild role.')
                .addStringOption(option => option.setName('name').setDescription('Role name.').setRequired(true))
                .addStringOption(option => option.setName('color').setDescription('Hexadecimal color.'))
                .addBooleanOption(option => option.setName('hoist').setDescription('Users should or shouldn\'t appear in a separate category in the users list.'))
                .addBooleanOption(option => option.setName('mentionable').setDescription('Role can be mentioned by anyone.'))
            )
            .addSubcommand(subcommand => subcommand
                .setName('update')
                .setDescription('Update a guild role.')
                .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('New role name.'))
                .addStringOption(option => option.setName('color').setDescription('Hexadecimal color.'))
                .addBooleanOption(option => option.setName('hoist').setDescription('Users should or shouldn\'t appear in a separate category in the users list.'))
                .addBooleanOption(option => option.setName('mentionable').setDescription('Role can be mentioned by anyone.'))
                .addIntegerOption(option => option.setName('position').setDescription('Role position in the role manager.'))
            )
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Delete a guild role.')
                .addRoleOption(option => option.setName('role').setDescription('Guild role.').setRequired(true))
            )
            .setDefaultPermission(false),
        new SlashCommandBuilder()
            .setName('channels')
            .setDescription('Manage channels.')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Create a guild channel.')
                .addStringOption(option => option.setName('name').setDescription('Channel name.').setRequired(true))
                .addIntegerOption(option => option.setName('type').setDescription('Whether it should be a text or voice channel.').addChoices([['Text', 1], ['Voice', 2]]).setRequired(true))
                .addStringOption(option => option.setName('topic').setDescription('Topic of the text channel.'))
                .addBooleanOption(option => option.setName('nsfw').setDescription('Whether the channel is NSFW.'))
                .addIntegerOption(option => option.setName('limit').setDescription('User limit of the voice channel.'))
            )
            .addSubcommand(subcommand => subcommand
                .setName('update')
                .setDescription('Update a guild channel.')
                .addChannelOption(option => option.setName('channel').setDescription('Guild channel.').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Channel name.'))
                .addStringOption(option => option.setName('topic').setDescription('Topic of the text channel.'))
                .addBooleanOption(option => option.setName('nsfw').setDescription('Whether the channel is NSFW.'))
                .addIntegerOption(option => option.setName('limit').setDescription('User limit of the voice channel.'))
            )
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Delete a guild channel.')
                .addChannelOption(option => option.setName('channel').setDescription('Guild channel.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('assign')
                .setDescription('Assign a bot message to a text channel.')
                .addIntegerOption(option => option.setName('category').setDescription('Message category.').setRequired(true).addChoices([['Roles', 1], ['Leaderboards', 2]]))
                .addChannelOption(option => option.setName('channel').setDescription('Text channel to receive bot message.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('dissociate')
                .setDescription('Dissociate a bot message from a text channel.')
                .addIntegerOption(option => option.setName('category').setDescription('Message category.').setRequired(true).addChoices([['Roles', 1], ['Leaderboards', 2]]))
                .addChannelOption(option => option.setName('channel').setDescription('Text channel which has the bot message assigned.').setRequired(true))
            )
            .setDefaultPermission(false),
        new SlashCommandBuilder()
            .setName('webhooks')
            .setDescription('Manage webhooks.')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Create a webhook and assign it to a text channel.')
                .addIntegerOption(option => option.setName('category').setDescription('Webhook category.').setRequired(true).addChoices([['NSFW', 1], ['Memes', 2], ['Gaming News', 3], ['Reviews', 4], ['Deals', 5], ['Free Games', 6], ['Xbox', 7], ['Playstation', 8], ['Nintendo', 9], ['Anime', 10], ['Manga', 11]]))
                .addChannelOption(option => option.setName('channel').setDescription('Text channel to receive webhook content.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Delete a webhook.')
                .addIntegerOption(option => option.setName('category').setDescription('Webhook category.').setRequired(true).addChoices([['NSFW', 1], ['Memes', 2], ['Gaming News', 3], ['Reviews', 4], ['Deals', 5], ['Free Games', 6], ['Xbox', 7], ['Playstation', 8], ['Nintendo', 9], ['Anime', 10], ['Manga', 11]]))
            )
            .setDefaultPermission(false),
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
            .setDescription('Returns the Youtube URL that matches your search query.')
            .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('reminder')
            .setDescription('Reminder related commands.')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Creates a reminder.')
                .addIntegerOption(option => option.setName('time').setDescription('In how much time you want to be reminded of your message.').setRequired(true))
                .addStringOption(option => option.setName('unit').setDescription('Time unit.').setRequired(true).addChoices([['Seconds', 'secs'], ['Minutes', 'mins'], ['Hours', 'hours'], ['Days', 'days'], ['Weeks', 'weeks'], ['Months', 'months'], ['Years', 'years']]))
                .addStringOption(option => option.setName('message').setDescription('Message you want to be reminded of.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Delete a reminder.')
                .addStringOption(option => option.setName('reminder').setDescription('ID of the reminder to be deleted.').setRequired(true))
            ),
        new SlashCommandBuilder()
            .setName('secretsanta')
            .setDescription('Organize a secret santa with mentioned users.')
            .addStringOption(option => option.setName('mentions').setDescription('Mention users participating in this Secret Santa.').setRequired(true)),
        new SlashCommandBuilder()
            .setName('integrations')
            .setDescription('Manage integrations with the bot.')
            .addSubcommand(subcommand => subcommand
                .setName('import')
                .setDescription('Adds an integration.')
                .addStringOption(option => option.setName('url').setDescription('Profile account URL.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('update')
                .setDescription('Update an integration.')
                .addStringOption(option => option.setName('url').setDescription('Profile account URL.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('sync')
                .setDescription('Synchronizes an integration manually.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('notifications')
                .setDescription('Turns an integration notifications on or off.')
                .addBooleanOption(option => option.setName('option').setDescription('Option as a boolean.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Deletes an integration.')
            ),
        new SlashCommandBuilder()
            .setName('steam')
            .setDescription('Steam related commands.')
            .addSubcommand(subcommand => subcommand
                .setName('sale')
                .setDescription('Returns the next steam sale.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('top')
                .setDescription('Returns Steam\'s top played games.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('hot')
                .setDescription('Returns Steam\'s top sellers.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('new')
                .setDescription('Returns Steam\'s upcoming games.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('leaderboard')
                .setDescription('Returns the Steam leaderboard for the week.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('profile')
                .setDescription('Returns the Steam profile for your account/mentioned user.')
                .addMentionableOption(option => option.setName('mention').setDescription('User mention.'))
            )
            .addSubcommand(subcommand => subcommand
                .setName('wishlist')
                .setDescription('Returns the Steam wishlist for your account/mentioned user.')
                .addMentionableOption(option => option.setName('mention').setDescription('User mention.'))
            ),
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
            .addIntegerOption(option => option.setName('category').setDescription('Comic category.').setRequired(true).addChoices([['Garfield', 1], ['Peanuts', 2], ['Get Fuzzy', 3], ['Fowl Language', 4], ['Calvin and Hobbes', 5], ['Jake Likes Onions', 6], ['Sarah\'s Scribbles', 7]])),
        new SlashCommandBuilder()
            .setName('jokes')
            .setDescription('Returns a joke from a given category.')
            .addIntegerOption(option => option.setName('category').setDescription('Joke category.').setRequired(true).addChoices([['Dark Joke', 1], ['Programming Joke', 2], ['Miscellaneous Joke', 3]])),
        new SlashCommandBuilder()
            .setName('reddit')
            .setDescription('Returns a random reddit post from a given category.')
            .addIntegerOption(option => option.setName('category').setDescription('Reddit category.').setRequired(true).addChoices([['Aww', 1], ['Memes', 2]])),
        new SlashCommandBuilder()
            .setName('music')
            .setDescription('Music related commands.')
            .addSubcommand(subcommand => subcommand
                .setName('join')
                .setDescription('Bot joins the voice channel you\'re in.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('leave')
                .setDescription('Bot leaves the voice channel.')
            ) 
            .addSubcommand(subcommand => subcommand
                .setName('play')
                .setDescription('Plays the first result matching your search query.')
                .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('search')
                .setDescription('Search the top 10 results for a given query.')
                .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('skip')
                .setDescription('Skips the current item playing.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('pause')
                .setDescription('Pauses the current item playing.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('resume')
                .setDescription('Resumes paused item.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('loop')
                .setDescription('Sets the current item in loop.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('volume')
                .setDescription('Sets the volume of the player.')
                .addIntegerOption(option => option.setName('volume').setDescription('Volume <0-100>.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('queue')
                .setDescription('Lists the current queue.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Removes an item from the queue matching a given position.')
                .addIntegerOption(option => option.setName('index').setDescription('Position in the queue of the item you wish to remove.').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand
                .setName('clear')
                .setDescription('Removes every item in the queue.')
            )           
    ].map(command => command.toJSON());

    for(const [guildID, guild] of client.guilds.cache) {
        const users = await guild.members.fetch();
        const administrator = users.find(item => item.permissions.has(Permissions.FLAGS.ADMINISTRATOR));

        const guildCommands = await guild.commands.set(commands);
        for(const [guildCommandID, guildCommand] of guildCommands) {
            if(guildCommand.defaultPermission) continue;

            await guild.commands.permissions.add({ 
                command: guildCommandID,
                permissions: [{
                        id: administrator.id,
                        type: 'USER',
                        permission: true
                }]
            });
        }
    }
}

export const commands = { createSlashCommands, comics, deals, prune, games, howlongtobeat, jokes, movies, music, poll, reddit, reminder, reviews, secretsanta, specs, integrations, roles, webhooks, channels, steam, tv, youtube };
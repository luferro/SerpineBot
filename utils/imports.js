//Commands imports
import cmd from '../commands/help.js';
import comics from '../commands/comics.js';
import deals from '../commands/deals.js';
import del from '../commands/delete.js';
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
//Worker imports
import leaderboards from '../worker/leaderboards.js';
import reminders from '../worker/reminders.js';
import roles from '../worker/roles.js';
import subscriptions from '../worker/subscriptions.js';
import wishlists from '../worker/wishlists.js';

const commands = { cmd, comics, deals, del, games, howlongtobeat, jokes, movies, music, poll, reddit, reminder, reviews, secretsanta, specs, steam, tv, youtube };
const worker = { leaderboards, reminders, roles, subscriptions, wishlists };

export { commands, worker };
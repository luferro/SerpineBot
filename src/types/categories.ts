export type ChannelCategories =
    | 'GUILD_TEXT'
    | 'GUILD_VOICE';

export type MessageCategories =
    | 'LEADERBOARDS_MESSAGE'
    | 'ROLES_MESSAGE'
    | 'BIRTHDAYS_MESSAGE';

export type HttpMethods =
    | 'GET'
    | 'PUT'
    | 'POST'
    | 'PATCH'
    | 'DELETE';

export type TimeUnits =
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'months'
    | 'years';

export type WebhookCategories =
    | 'NSFW'
    | 'Memes'
    | 'World News'
    | 'Gaming News'
    | 'Reviews'
    | 'Deals'
    | 'Free Games'
    | 'Xbox'
    | 'Playstation'
    | 'Nintendo'
    | 'Anime'
    | 'Manga';

export type JokeCategories =
    | 'dark'
    | 'programming'
    | 'miscellaneous';

export type ComicCategories =
    | 'garfield'
    | 'peanuts'
    | 'get fuzzy'
    | 'fowl language'
    | 'calvin and hobbes'
    | 'jake likes onions'
    | 'sarahs scribbles'
    | 'worry lines';

export type TheMovieDBCategories =
    | 'tv'
    | 'movie';

export type BlogCategories =
    | 'bundles'
    | 'sales'
    | 'prime gaming';

export type DealCategories =
    | 'free games'
    | 'paid games';

export type XboxWireCategories =
    | 'gamepass'
    | 'deals with gold'
    | 'games with gold';

export type GamePassCategories =
    | 'PC'
    | 'Xbox';

export type EAPlayCategories =
    | 'Base'
    | 'Pro';

export enum SteamStatus {
    'Offline',
    'Online',
    'Busy',
    'Away',
    'Snooze',
    'Looking to trade',
    'Looking to play'
}
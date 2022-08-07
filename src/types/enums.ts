export enum HttpMethod {
	GET = 'GET',
	PUT = 'PUT',
	POST = 'POST',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}

export enum CommandName {
	Birthdays = 'birthdays',
	Channels = 'channels',
	Comics = 'comics',
	Deals = 'deals',
	HowLongToBeat = 'hltb',
	Integrations = 'integrations',
	Jokes = 'jokes',
	Memes = 'memes',
	Movies = 'movies',
	Music = 'music',
	Poll = 'poll',
	Prune = 'prune',
	Reminders = 'reminders',
	Reviews = 'reviews',
	Roles = 'roles',
	SecretSanta = 'secretsanta',
	Series = 'series',
	Steam = 'steam',
	Subscriptions = 'subscriptions',
	Webhooks = 'webhooks',
	Xbox = 'xbox',
	Youtube = 'youtube',
}

export enum JobName {
	Birthdays = 'birthdays',
	Leaderboards = 'leaderboards',
	Reminders = 'reminders',
	Roles = 'roles',
	Subsriptions = 'subscriptions',
	Wishlists = 'wishlists',
}

export enum WebhookJobName {
	Nsfw = 'nsfw',
	Memes = 'memes',
	Anime = 'anime',
	Manga = 'manga',
	WorldNews = 'worldNews',
	GamingNews = 'gamingNews',
	Reviews = 'reviews',
	Deals = 'deals',
	Xbox = 'xbox',
	Playstation = 'playstation',
	Nintendo = 'nintendo',
}

export enum EventName {
	Ready = 'ready',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	GuildMemberAdd = 'guildMemberAdd',
	InteractionCreate = 'interactionCreate',
	VoiceStateUpdate = 'voiceStateUpdate',
}

export enum WebhookCategory {
	Nsfw,
	Memes,
	Anime,
	Manga,
	WorldNews,
	GamingNews,
	Reviews,
	Deals,
	FreeGames,
	Xbox,
	Playstation,
	Nintendo,
}

export enum MessageCategory {
	Roles,
	Leaderboards,
	Birthdays,
}

export enum ComicSelection {
	Garfield,
	Peanuts,
	GetFuzzy,
	FowlLanguage,
	CalvinAndHobbes,
	JakeLikesOnions,
	SarahsScribbles,
	WorryLines,
}

export enum JokeCategory {
	Dark,
	Programming,
	Miscellaneous,
}

export enum SubscriptionCategory {
	Gaming,
	Movies,
	Series,
}

export enum GamingSubscription {
	XboxGamepass,
	PcGamePass,
	EaPlay,
	EaPlayPro,
	UbisoftPlus,
}

export enum DealsCategory {
	Bundles,
	Sales,
	PrimeGaming,
	FreeGames,
	PaidGames,
}

export enum XboxWireCategory {
	Gamepass,
	DealsWithGold,
	GamesWithGold,
	Podcast,
}

export enum PlaystationBlogCategory {
	PlaystationPlus,
	PlaystationStore,
	StateOfPlay,
}

export enum AlertCategory {
	Sale,
	Released,
	AddedToSubscription,
	RemovedFromSubscription,
}

export enum IntegrationCategory {
	Steam,
	Xbox,
}

export enum AnimeAggregator {
	Kitsu = 'kitsu.io',
	AniList = 'anilist.co',
	MyAnimeList = 'myanimelist.net',
	AnimePlanet = 'www.anime-planet.com',
	AniDb = 'anidb.net',
}

export enum AnimeStream {
	Vrv = 'vrv.co',
	HiDive = 'www.hidive.com',
	Netflix = 'www.netflix.com',
	AnimeLab = 'www.animelab.com',
	Crunchyroll = 'crunchyroll.com',
}

export enum TimeUnit {
	Seconds,
	Minutes,
	Hours,
	Days,
	Weeks,
	Months,
	Years,
}

export enum SteamStatus {
	Offline,
	Online,
	Busy,
	Away,
	Snooze,
	LookingToTrade,
	LookingToPlay,
}

export enum Medals {
	'🥇' = 1,
	'🥈',
	'🥉',
}

export enum PollOptions {
	'1️⃣' = 1,
	'2️⃣',
	'3️⃣',
	'4️⃣',
	'5️⃣',
	'6️⃣',
	'7️⃣',
	'8️⃣',
	'9️⃣',
	'🔟',
}

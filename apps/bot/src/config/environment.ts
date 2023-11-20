type NonNullableConfig<T> = { [K in keyof T]: NonNullable<T[K]> };

const getConfig = () => ({
	NODE_ENV: process.env.NODE_ENV ?? 'PRODUCTION',

	// DISCORD TOKEN
	BOT_TOKEN: process.env.BOT_TOKEN ?? null,

	// Region
	LOCALE: process.env.LOCALE ?? 'en-US',

	// PICOVOICE
	PICOVOICE_API_KEY: process.env.PICOVOICE_API_KEY ?? null,

	// API KEYS
	STEAM_API_KEY: process.env.STEAM_API_KEY ?? null,
	THE_MOVIE_DB_API_KEY: process.env.THE_MOVIE_DB_API_KEY ?? null,
	ANIME_SCHEDULE_API_KEY: process.env.ANIME_SCHEDULE_API_KEY ?? null,
	ITAD_API_KEY: process.env.ITAD_API_KEY ?? null,
	IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID ?? null,
	IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET ?? null,

	// SUBREDDITS
	NSFW_SUBREDDITS: process.env.NSFW_SUBREDDITS?.split(',') ?? [],
	MEMES_SUBREDDITS: process.env.MEMES_SUBREDDITS?.split(',') ?? [],
});

export type SanitizedConfig = ReturnType<typeof getSanitizedConfig>;

export const getSanitizedConfig = () => {
	const config = getConfig();
	for (const [key, value] of Object.entries(config)) {
		if (!value) throw new Error(`Environment variable ${key} is missing.`);
	}

	return config as NonNullableConfig<typeof config>;
};

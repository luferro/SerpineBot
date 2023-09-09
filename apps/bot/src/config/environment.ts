type NonNullableConfig<T> = { [K in keyof T]: NonNullable<T[K]> };

const getEnvConfig = () => ({
	NODE_ENV: process.env.NODE_ENV ?? 'PRODUCTION',

	// DISCORD TOKEN
	BOT_TOKEN: process.env.BOT_TOKEN ?? null,

	// DATABASE URI
	MONGO_URI: process.env.MONGO_URI ?? null,

	// Region
	LOCALE: process.env.LOCALE ?? 'en-US',

	// PICOVOICE
	PICOVOICE_API_KEY: process.env.PICOVOICE_API_KEY ?? null,

	// API KEYS
	STEAM_API_KEY: process.env.STEAM_API_KEY ?? null,
	GNEWS_API_KEY: process.env.GNEWS_API_KEY ?? null,
	THE_MOVIE_DB_API_KEY: process.env.THE_MOVIE_DB_API_KEY ?? null,
	ANIME_SCHEDULE_API_KEY: process.env.ANIME_SCHEDULE_API_KEY ?? null,
	ITAD_API_KEY: process.env.ITAD_API_KEY ?? null,

	// SUBREDDITS
	NSFW_SUBREDDITS: process.env.NSFW_SUBREDDITS?.split(',') ?? [],
	MEMES_SUBREDDITS: process.env.MEMES_SUBREDDITS?.split(',') ?? [],
});

export const getSanitizedEnvConfig = () => {
	const config = getEnvConfig();
	for (const [key, value] of Object.entries(config)) {
		if (!value) throw new Error(`Environment variable ${key} is missing.`);
	}

	return config as NonNullableConfig<typeof config>;
};

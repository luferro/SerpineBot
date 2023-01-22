const getEnvConfig = () => ({
	NODE_ENV: {
		value: process.env.NODE_ENV ?? 'production',
		isRequired: false,
	},
	BOT_TOKEN: {
		value: process.env.BOT_TOKEN ?? null,
		isRequired: true,
	},
	MONGO_URI: {
		value: process.env.MONGO_URI ?? null,
		isRequired: true,
	},
	THE_MOVIE_DB_API_KEY: {
		value: process.env.THE_MOVIE_DB_API_KEY ?? null,
		isRequired: true,
	},
	STEAM_API_KEY: {
		value: process.env.STEAM_API_KEY ?? null,
		isRequired: true,
	},
	TENOR_API_KEY: {
		value: process.env.TENOR_API_KEY ?? null,
		isRequired: true,
	},
	GNEWS_API_KEY: {
		value: process.env.GNEWS_API_KEY ?? null,
		isRequired: true,
	},
	NSFW_SUBREDDITS: {
		value: process.env.NSFW_SUBREDDITS?.split(',') ?? [],
		isRequired: false,
	},
	MEMES_SUBREDDITS: {
		value: process.env.MEMES_SUBREDDITS?.split(',') ?? [],
		isRequired: false,
	},
});

const getSanitizedEnvConfig = () => {
	const missingEnvVariables = [];

	const envConfig = getEnvConfig();
	for (const [key, config] of Object.entries(envConfig)) {
		if (config.isRequired && !config.value) missingEnvVariables.push(key);
	}

	if (missingEnvVariables.length > 0)
		throw new Error(`Missing the following environment variable(s):\n${missingEnvVariables.join('\n')}`);

	return {
		NODE_ENV: envConfig.NODE_ENV.value as string,
		BOT_TOKEN: envConfig.BOT_TOKEN.value as string,
		MONGO_URI: envConfig.MONGO_URI.value as string,
		THE_MOVIE_DB_API_KEY: envConfig.THE_MOVIE_DB_API_KEY.value as string,
		STEAM_API_KEY: envConfig.STEAM_API_KEY.value as string,
		TENOR_API_KEY: envConfig.TENOR_API_KEY.value as string,
		GNEWS_API_KEY: envConfig.GNEWS_API_KEY.value as string,
		NSFW_SUBREDDITS: envConfig.NSFW_SUBREDDITS.value as string[],
		MEMES_SUBREDDITS: envConfig.MEMES_SUBREDDITS.value as string[],
	};
};

export const config = getSanitizedEnvConfig();

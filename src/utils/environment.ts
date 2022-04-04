import { EnvironmentError } from '../errors/environmentError';

export const scanVariables = () => {
    const keys: ReadonlyArray<string> = [
        'BOT_TOKEN',
        'MONGO_URI',
        'YOUTUBE_API_KEY',
        'THEMOVIEDB_API_KEY',
        'STEAM_API_KEY',
        'TENOR_API_KEY',
        'NEWS_API_KEY'
    ];

    const keysNotFound = [];
    for(const key of keys) {
        if(!process.env[key]) keysNotFound.push(key);
    }

    if(keysNotFound.length > 0) throw new EnvironmentError(`The following environment variables were not found:\n${keysNotFound.join('\n')}`);
}
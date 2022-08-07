import { fetch } from '../utils/fetch';
import { Joke } from '../types/responses';
import { JokeCategory } from '../types/enums';

export const getJokeByCategory = async (category: JokeCategory) => {
	const { joke, setup, delivery } = await fetch<Joke>({
		url: `https://sv443.net/jokeapi/v2/joke/${JokeCategory[category].toLowerCase()}`,
	});

	return {
		joke: joke ?? `${setup}\n${delivery}`,
	};
};

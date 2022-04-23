import { fetch } from '../services/fetch';
import * as StringUtil from '../utils/string';
import { JokeCategories } from '../types/categories';
import { Joke } from '../types/responses';

export const getJokeByCategory = async (category: JokeCategories) => {
	const data = await fetch<Joke>(`https://sv443.net/jokeapi/v2/joke/${category}`);
	const { joke, setup, delivery } = data;

	return {
		category: `${StringUtil.capitalize(category)} Joke`,
		joke: joke ?? `${setup}\n${delivery}`,
	};
};

import { fetch } from '../utils/fetch';
import * as StringUtil from '../utils/string';
import { JokeCategories } from '../types/categories';
import { Joke } from '../types/responses';

export const getJokeByCategory = async (category: JokeCategories) => {
	const { joke, setup, delivery } = await fetch<Joke>({ url: `https://sv443.net/jokeapi/v2/joke/${category}` });

	return {
		category: `${StringUtil.capitalize(category)} Joke`,
		joke: joke ?? `${setup}\n${delivery}`,
	};
};

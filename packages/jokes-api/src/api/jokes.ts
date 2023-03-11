import { FetchUtil } from '@luferro/shared-utils';

import type { JokeCategory } from '../types/category';
import type { JokesResponse } from '../types/response';

const JokeCategories = Object.freeze<Record<JokeCategory, string>>({
	Dark: 'dark',
	Programming: 'programming',
	Miscellaneous: 'miscellaneous',
});

export const getRandomJokeByCategory = async (category: JokeCategory) => {
	const { joke, setup, delivery } = await FetchUtil.fetch<JokesResponse>({
		url: `https://sv443.net/jokeapi/v2/joke/${JokeCategories[category]}`,
	});

	return {
		joke: joke ?? `${setup}\n${delivery}`,
	};
};

import { SubscriptionsModel } from '@luferro/database';
import type { TheMovieDbCategory } from '@luferro/the-movie-db-api';
import { TheMovieDbApi } from '@luferro/the-movie-db-api';

export const getGamingSubscriptions = async (title: string) => {
	return await SubscriptionsModel.getCatalogMatches(title);
};

export const getStreamingSubscriptions = async (title: string, category: TheMovieDbCategory) => {
	const { id } = await TheMovieDbApi.search(title, category);
	if (!id) return [];

	const { stream } = await TheMovieDbApi.getProviders(id, category);
	return stream.sort((a, b) => a.name.localeCompare(b.name)).map(({ name, entry }) => ({ name, entry }));
};

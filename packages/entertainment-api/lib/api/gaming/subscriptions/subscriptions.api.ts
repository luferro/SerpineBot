import { getCatalogData } from './subscriptions.scraper';

export const getCatalogs = async () => {
	const data = [];
	for (const catalog of ['Xbox Game Pass', 'PC Game Pass', 'EA Play', 'EA Play Pro', 'Ubisoft Plus'] as const) {
		data.push(await getCatalogData({ catalog }));
	}
	return data;
};

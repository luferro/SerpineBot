import { Endpoint, getCatalogData } from './subscriptions.scraper';

type Catalog = { catalog: keyof typeof Endpoint };

export const getCatalog = async ({ catalog }: Catalog) => await getCatalogData(Endpoint[catalog]);

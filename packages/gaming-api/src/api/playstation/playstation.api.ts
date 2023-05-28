import { Endpoint, getBlogList } from './playstation.scraper';

export const getLatestPlusAdditions = async () => await getBlogList(Endpoint.LATEST_PLAYSTATION_PLUS);

export const getLatestStoreSales = async () => await getBlogList(Endpoint.LATEST_PLAYSTATION_STORE);

export const getLatestStateOfPlayEvents = async () => await getBlogList(Endpoint.LATEST_STATE_OF_PLAY);

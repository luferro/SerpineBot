import { Endpoint, getNewsList } from './nintendo.scraper';

export const getLatestNews = async () => await getNewsList(Endpoint.LATEST_NEWS);

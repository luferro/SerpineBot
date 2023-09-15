import { Endpoint, getNewsList } from './nintendo.scraper';

export const getNews = async () => await getNewsList(Endpoint.NEWS);

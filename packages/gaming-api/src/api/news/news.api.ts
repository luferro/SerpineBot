import { Endpoint, getNewsList } from './news.scraper';

export const getLatestNews = async () => await getNewsList(Endpoint.LATEST_NEWS);

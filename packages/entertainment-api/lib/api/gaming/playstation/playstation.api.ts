import { Feed, getPlaystationFeed } from './playstation.feed';

export const getLatestPlusAdditions = async () => await getPlaystationFeed({ url: Feed.PLAYSTATION_PLUS });

export const getLatestStoreSales = async () => await getPlaystationFeed({ url: Feed.PLAYSTATION_STORE });

export const getLatestStateOfPlayEvents = async () => await getPlaystationFeed({ url: Feed.STATE_OF_PLAY });

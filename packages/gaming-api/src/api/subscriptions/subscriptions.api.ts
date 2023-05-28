import { Endpoint, getCatalogList } from './subscriptions.scraper';

export const getXboxGamePassCatalog = async () => await getCatalogList(Endpoint.XBOX_GAME_PASS_CATALOG);

export const getPcGamePassCatalog = async () => await getCatalogList(Endpoint.PC_GAME_PASS_CATALOG);

export const getEaPlayCatalog = async () => await getCatalogList(Endpoint.EA_PLAY_CATALOG);

export const getEaPlayProCatalog = async () => await getCatalogList(Endpoint.EA_PLAY_PRO_CATALOG);

export const getUbisoftPlusCatalog = async () => await getCatalogList(Endpoint.UBISOFT_PLUS_CATALOG);

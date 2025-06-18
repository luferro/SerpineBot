import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '~/context.js';
export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type AniList = {
  __typename?: 'AniList';
  airingSchedule: Array<AniListAiringSchedule>;
  browse: AniListMediaPage;
  character: AniListCharacterWithConnections;
  characters: AniListCharactersPage;
  genres: Array<Scalars['String']['output']>;
  media: AniListMediaWithConnections;
  recommendations: AniListMediaRecommendationsPage;
  search: AniListMultiSearchResult;
  staffMember: AniListStaffWithConnections;
  staffMembers: AniListStaffMembersPage;
  studio: AniListStudioWithConnections;
  tags: Array<AniListTag>;
  trending: AniListMediaPage;
};


export type AniListAiringScheduleArgs = {
  input?: InputMaybe<AniListAiringScheduleInput>;
};


export type AniListBrowseArgs = {
  input?: InputMaybe<AniListBrowseInput>;
};


export type AniListCharacterArgs = {
  input: AniListCharacterPageInput;
};


export type AniListCharactersArgs = {
  input: AniListPageInput;
};


export type AniListMediaArgs = {
  input: AniListMediaInput;
};


export type AniListRecommendationsArgs = {
  input: AniListPageInput;
};


export type AniListSearchArgs = {
  input: AniListSearchInput;
};


export type AniListStaffMemberArgs = {
  input: AniListStaffMemberPageInput;
};


export type AniListStaffMembersArgs = {
  input: AniListPageInput;
};


export type AniListStudioArgs = {
  input: AniListPageInput;
};

export type AniListAiringSchedule = {
  __typename?: 'AniListAiringSchedule';
  airingAt: Scalars['Int']['output'];
  episode: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  media: AniListMediaWithConnections;
};

export type AniListAiringScheduleInput = {
  end: Scalars['Timestamp']['input'];
  start: Scalars['Timestamp']['input'];
};

export type AniListBrowseInput = {
  chapterGreater?: InputMaybe<Scalars['Int']['input']>;
  chapterLesser?: InputMaybe<Scalars['Int']['input']>;
  countryOfOrigin?: InputMaybe<Scalars['String']['input']>;
  durationGreater?: InputMaybe<Scalars['Int']['input']>;
  durationLesser?: InputMaybe<Scalars['Int']['input']>;
  episodeGreater?: InputMaybe<Scalars['Int']['input']>;
  episodeLesser?: InputMaybe<Scalars['Int']['input']>;
  excludedGenres?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  excludedTags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  format?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  genres?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['Int']['input']>;
  isAdult?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  season?: InputMaybe<Scalars['String']['input']>;
  seasonYear?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<AniListMediaType>;
  volumeGreater?: InputMaybe<Scalars['Int']['input']>;
  volumeLesser?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
  yearGreater?: InputMaybe<Scalars['Int']['input']>;
  yearLesser?: InputMaybe<Scalars['Int']['input']>;
};

export type AniListCharacter = {
  __typename?: 'AniListCharacter';
  age?: Maybe<Scalars['String']['output']>;
  bloodType?: Maybe<Scalars['String']['output']>;
  dateOfBirth: AniListFuzzyDate;
  description?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type AniListCharacterMediaConnection = {
  __typename?: 'AniListCharacterMediaConnection';
  media: AniListMedia;
  role: Scalars['String']['output'];
  staff: Array<AniListStaff>;
};

export type AniListCharacterPage = {
  __typename?: 'AniListCharacterPage';
  media: Array<AniListCharacterMediaConnection>;
  pageInfo: AniListPageInfo;
};

export type AniListCharacterPageInput = {
  id: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  withRoles?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AniListCharacterWithConnections = {
  __typename?: 'AniListCharacterWithConnections';
  age?: Maybe<Scalars['String']['output']>;
  bloodType?: Maybe<Scalars['String']['output']>;
  dateOfBirth: AniListFuzzyDate;
  description?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  media: AniListCharacterPage;
  name: Scalars['String']['output'];
};

export type AniListCharactersPage = {
  __typename?: 'AniListCharactersPage';
  characters: Array<AniListMediaCharactersConnection>;
  pageInfo: AniListPageInfo;
};

export type AniListCharactersSearchResult = {
  __typename?: 'AniListCharactersSearchResult';
  pageInfo: AniListPageInfo;
  results?: Maybe<Array<Maybe<AniListCharacter>>>;
};

export type AniListCoverImage = {
  __typename?: 'AniListCoverImage';
  extraLarge?: Maybe<Scalars['String']['output']>;
  large?: Maybe<Scalars['String']['output']>;
  medium?: Maybe<Scalars['String']['output']>;
};

export type AniListEpisode = {
  __typename?: 'AniListEpisode';
  airingAt?: Maybe<Scalars['Timestamp']['output']>;
  episode?: Maybe<Scalars['Int']['output']>;
};

export type AniListFuzzyDate = {
  __typename?: 'AniListFuzzyDate';
  day?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['String']['output']>;
};

export type AniListMedia = {
  __typename?: 'AniListMedia';
  averageScore?: Maybe<Scalars['Int']['output']>;
  bannerImage?: Maybe<Scalars['String']['output']>;
  chapters?: Maybe<Scalars['Int']['output']>;
  countryOfOrigin: Scalars['String']['output'];
  coverImage: AniListCoverImage;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<AniListFuzzyDate>;
  episodes?: Maybe<Scalars['Int']['output']>;
  format?: Maybe<Scalars['String']['output']>;
  genres: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isLicensed: Scalars['Boolean']['output'];
  isMature: Scalars['Boolean']['output'];
  malId?: Maybe<Scalars['Int']['output']>;
  meanScore?: Maybe<Scalars['Int']['output']>;
  nextAiringEpisode: AniListEpisode;
  popularity?: Maybe<Scalars['Int']['output']>;
  rankings: Array<AniListRanking>;
  season?: Maybe<Scalars['String']['output']>;
  seasonYear?: Maybe<Scalars['Int']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<AniListFuzzyDate>;
  status?: Maybe<Scalars['String']['output']>;
  streams: Array<AniListStream>;
  title: AniListTitle;
  trackers: Array<AniListTracker>;
  trailer: AniListTrailer;
  type: AniListMediaType;
  volumes?: Maybe<Scalars['Int']['output']>;
};

export type AniListMediaCharactersConnection = {
  __typename?: 'AniListMediaCharactersConnection';
  character: AniListCharacter;
  role?: Maybe<Scalars['String']['output']>;
  voiceActors: Array<AniListStaff>;
};

export type AniListMediaInput = {
  id: Scalars['Int']['input'];
  type: AniListMediaType;
};

export type AniListMediaPage = {
  __typename?: 'AniListMediaPage';
  media: Array<AniListMediaWithConnections>;
  pageInfo: AniListPageInfo;
};

export type AniListMediaRecommendationsConnection = {
  __typename?: 'AniListMediaRecommendationsConnection';
  id: Scalars['Int']['output'];
  media: AniListMedia;
  rating?: Maybe<Scalars['Int']['output']>;
};

export type AniListMediaRecommendationsPage = {
  __typename?: 'AniListMediaRecommendationsPage';
  pageInfo: AniListPageInfo;
  recommendations: Array<AniListMediaRecommendationsConnection>;
};

export type AniListMediaRelationsConnection = {
  __typename?: 'AniListMediaRelationsConnection';
  media: AniListMedia;
  relationType?: Maybe<Scalars['String']['output']>;
};

export type AniListMediaSearchResult = {
  __typename?: 'AniListMediaSearchResult';
  pageInfo: AniListPageInfo;
  results?: Maybe<Array<Maybe<AniListMedia>>>;
};

export type AniListMediaStaffConnection = {
  __typename?: 'AniListMediaStaffConnection';
  role?: Maybe<Scalars['String']['output']>;
  staff: AniListStaff;
};

export type AniListMediaStudiosConnection = {
  __typename?: 'AniListMediaStudiosConnection';
  isMain?: Maybe<Scalars['Boolean']['output']>;
  studio: AniListStudio;
};

export enum AniListMediaType {
  Anime = 'ANIME',
  Manga = 'MANGA'
}

export type AniListMediaWithConnections = {
  __typename?: 'AniListMediaWithConnections';
  averageScore?: Maybe<Scalars['Int']['output']>;
  bannerImage?: Maybe<Scalars['String']['output']>;
  chapters?: Maybe<Scalars['Int']['output']>;
  characters: Array<AniListMediaCharactersConnection>;
  countryOfOrigin: Scalars['String']['output'];
  coverImage: AniListCoverImage;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<AniListFuzzyDate>;
  episodes?: Maybe<Scalars['Int']['output']>;
  format?: Maybe<Scalars['String']['output']>;
  genres: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isLicensed: Scalars['Boolean']['output'];
  isMature: Scalars['Boolean']['output'];
  malId?: Maybe<Scalars['Int']['output']>;
  meanScore?: Maybe<Scalars['Int']['output']>;
  nextAiringEpisode: AniListEpisode;
  popularity?: Maybe<Scalars['Int']['output']>;
  rankings: Array<AniListRanking>;
  recommendations: Array<AniListMediaRecommendationsConnection>;
  relations: Array<AniListMediaRelationsConnection>;
  season?: Maybe<Scalars['String']['output']>;
  seasonYear?: Maybe<Scalars['Int']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  staff: Array<AniListMediaStaffConnection>;
  startDate?: Maybe<AniListFuzzyDate>;
  status?: Maybe<Scalars['String']['output']>;
  streams: Array<AniListStream>;
  studios: Array<AniListMediaStudiosConnection>;
  title: AniListTitle;
  trackers: Array<AniListTracker>;
  trailer: AniListTrailer;
  type: AniListMediaType;
  volumes?: Maybe<Scalars['Int']['output']>;
};

export type AniListMultiSearchResult = {
  __typename?: 'AniListMultiSearchResult';
  anime: AniListMediaSearchResult;
  characters: AniListCharactersSearchResult;
  manga: AniListMediaSearchResult;
  staff: AniListStaffSearchResult;
  studios: AniListStudiosSearchResult;
};

export type AniListPageInfo = {
  __typename?: 'AniListPageInfo';
  currentPage?: Maybe<Scalars['Int']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  lastPage?: Maybe<Scalars['Int']['output']>;
  perPage?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type AniListPageInput = {
  id: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type AniListRanking = {
  __typename?: 'AniListRanking';
  allTime: Scalars['Boolean']['output'];
  context: Scalars['String']['output'];
  format: Scalars['String']['output'];
  formatted: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  rank: Scalars['Int']['output'];
  season?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  year?: Maybe<Scalars['Int']['output']>;
};

export type AniListSearchInput = {
  isMature?: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
};

export type AniListStaff = {
  __typename?: 'AniListStaff';
  age?: Maybe<Scalars['Int']['output']>;
  bloodType?: Maybe<Scalars['String']['output']>;
  dateOfBirth: AniListFuzzyDate;
  dateOfDeath: AniListFuzzyDate;
  description?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  homeTown?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
  primaryOccupations: Array<Scalars['String']['output']>;
  yearsActive?: Maybe<Array<Scalars['Int']['output']>>;
};

export type AniListStaffCharactersConnection = {
  __typename?: 'AniListStaffCharactersConnection';
  characters: Array<AniListCharacter>;
  media: AniListMedia;
  role: Scalars['String']['output'];
};

export type AniListStaffMemberPageInput = {
  characterPage?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
  staffPage?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<AniListMediaType>;
  withCharacterRoles?: InputMaybe<Scalars['Boolean']['input']>;
  withStaffRoles?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AniListStaffMembersPage = {
  __typename?: 'AniListStaffMembersPage';
  pageInfo: AniListPageInfo;
  staff: Array<AniListMediaStaffConnection>;
};

export type AniListStaffProductionConnection = {
  __typename?: 'AniListStaffProductionConnection';
  media: AniListMedia;
  role: Scalars['String']['output'];
};

export type AniListStaffProductionPage = {
  __typename?: 'AniListStaffProductionPage';
  pageInfo: AniListPageInfo;
  roles: Array<AniListStaffProductionConnection>;
};

export type AniListStaffSearchResult = {
  __typename?: 'AniListStaffSearchResult';
  pageInfo: AniListPageInfo;
  results?: Maybe<Array<Maybe<AniListStaff>>>;
};

export type AniListStaffVoiceActingConnection = {
  __typename?: 'AniListStaffVoiceActingConnection';
  characters: Array<AniListCharacter>;
  media: AniListMedia;
  role: Scalars['String']['output'];
};

export type AniListStaffVoiceActingPage = {
  __typename?: 'AniListStaffVoiceActingPage';
  characters: Array<AniListStaffVoiceActingConnection>;
  pageInfo: AniListPageInfo;
};

export type AniListStaffWithConnections = {
  __typename?: 'AniListStaffWithConnections';
  age?: Maybe<Scalars['Int']['output']>;
  bloodType?: Maybe<Scalars['String']['output']>;
  dateOfBirth: AniListFuzzyDate;
  dateOfDeath: AniListFuzzyDate;
  description?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  homeTown?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
  primaryOccupations: Array<Scalars['String']['output']>;
  production: AniListStaffProductionPage;
  voiceActing: AniListStaffVoiceActingPage;
  yearsActive?: Maybe<Array<Scalars['Int']['output']>>;
};

export type AniListStream = {
  __typename?: 'AniListStream';
  iconUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type AniListStudio = {
  __typename?: 'AniListStudio';
  id: Scalars['Int']['output'];
  isAnimationStudio?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
};

export type AniListStudioMediaConnection = {
  __typename?: 'AniListStudioMediaConnection';
  isMainStudio: Scalars['Boolean']['output'];
  media: AniListMedia;
};

export type AniListStudioPage = {
  __typename?: 'AniListStudioPage';
  media: Array<AniListStudioMediaConnection>;
  pageInfo: AniListPageInfo;
};

export type AniListStudioWithConnections = {
  __typename?: 'AniListStudioWithConnections';
  id: Scalars['Int']['output'];
  isAnimationStudio?: Maybe<Scalars['Boolean']['output']>;
  media: AniListStudioPage;
  name?: Maybe<Scalars['String']['output']>;
};

export type AniListStudiosSearchResult = {
  __typename?: 'AniListStudiosSearchResult';
  pageInfo: AniListPageInfo;
  results?: Maybe<Array<Maybe<AniListStudio>>>;
};

export type AniListTag = {
  __typename?: 'AniListTag';
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  isAdult: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type AniListTitle = {
  __typename?: 'AniListTitle';
  english?: Maybe<Scalars['String']['output']>;
  native: Scalars['String']['output'];
  romaji?: Maybe<Scalars['String']['output']>;
};

export type AniListTracker = {
  __typename?: 'AniListTracker';
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type AniListTrailer = {
  __typename?: 'AniListTrailer';
  id?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type AnimeSchedule = {
  __typename?: 'AnimeSchedule';
  airingSchedule: Array<AnimeScheduleAiringSchedule>;
};


export type AnimeScheduleAiringScheduleArgs = {
  input?: InputMaybe<AnimeScheduleAiringScheduleInput>;
};

export type AnimeScheduleAiringEpisode = {
  __typename?: 'AnimeScheduleAiringEpisode';
  airingAt: Scalars['Timestamp']['output'];
  delay: AnimeScheduleAiringEpisodeDelay;
  episode: Scalars['Int']['output'];
};

export type AnimeScheduleAiringEpisodeDelay = {
  __typename?: 'AnimeScheduleAiringEpisodeDelay';
  from?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
};

export type AnimeScheduleAiringSchedule = {
  __typename?: 'AnimeScheduleAiringSchedule';
  airing: AnimeScheduleAiringEpisode;
  duration: Scalars['Int']['output'];
  episodes?: Maybe<Scalars['Int']['output']>;
  hasAired: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  isAiring: Scalars['Boolean']['output'];
  isDelayed: Scalars['Boolean']['output'];
  title: AnimeScheduleTitle;
};

export type AnimeScheduleAiringScheduleInput = {
  end: Scalars['Timestamp']['input'];
  start: Scalars['Timestamp']['input'];
  tz?: InputMaybe<Scalars['String']['input']>;
};

export type AnimeScheduleTitle = {
  __typename?: 'AnimeScheduleTitle';
  default: Scalars['String']['output'];
  english?: Maybe<Scalars['String']['output']>;
  native?: Maybe<Scalars['String']['output']>;
  romaji?: Maybe<Scalars['String']['output']>;
};

export type Hltb = {
  __typename?: 'Hltb';
  playtimes: HltbPlaytimes;
  search: Array<HltbSearchResult>;
};


export type HltbPlaytimesArgs = {
  id: Scalars['String']['input'];
};


export type HltbSearchArgs = {
  query: Scalars['String']['input'];
};

export type HltbPlaytimes = {
  __typename?: 'HltbPlaytimes';
  completionist?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  main?: Maybe<Scalars['String']['output']>;
  mainExtra?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type HltbSearchResult = {
  __typename?: 'HltbSearchResult';
  id: Scalars['String']['output'];
  releaseYear: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type Igdb = {
  __typename?: 'Igdb';
  search: Array<IgdbSearchResult>;
  upcomingEvents: Array<IgdbGamingEvent>;
};


export type IgdbSearchArgs = {
  query: Scalars['String']['input'];
};

export type IgdbGamingEvent = {
  __typename?: 'IgdbGamingEvent';
  description?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  scheduledEndAt: Scalars['Timestamp']['output'];
  scheduledStartAt: Scalars['Timestamp']['output'];
  url: IgdbGamingEventUrl;
};

export type IgdbGamingEventUrl = {
  __typename?: 'IgdbGamingEventUrl';
  twitch?: Maybe<Scalars['String']['output']>;
  youtube?: Maybe<Scalars['String']['output']>;
};

export type IgdbSearchResult = {
  __typename?: 'IgdbSearchResult';
  id: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Itad = {
  __typename?: 'Itad';
  deal: ItadOverview;
  freebies: Array<ItadFreebie>;
  search: Array<ItadSearchResult>;
};


export type ItadDealArgs = {
  input: ItadDealInput;
};


export type ItadFreebiesArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
};


export type ItadSearchArgs = {
  query: Scalars['String']['input'];
};

export type ItadBundle = {
  __typename?: 'ItadBundle';
  expiry?: Maybe<Scalars['Timestamp']['output']>;
  id: Scalars['Int']['output'];
  store: Scalars['String']['output'];
  tiers: Array<ItadBundleTier>;
  timestamp: Scalars['Timestamp']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ItadBundleTier = {
  __typename?: 'ItadBundleTier';
  games: Array<ItadBundleTierGame>;
  price?: Maybe<ItadPrice>;
};

export type ItadBundleTierGame = {
  __typename?: 'ItadBundleTierGame';
  id: Scalars['String']['output'];
  mature: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type ItadDeal = {
  __typename?: 'ItadDeal';
  discount: Scalars['Int']['output'];
  discounted: ItadPrice;
  drm: Array<Scalars['String']['output']>;
  expiry?: Maybe<Scalars['Timestamp']['output']>;
  platforms: Array<Scalars['String']['output']>;
  regular: ItadPrice;
  store: Scalars['String']['output'];
  storeHistoricalLow?: Maybe<ItadPrice>;
  timestamp: Scalars['Timestamp']['output'];
  url: Scalars['String']['output'];
  voucher?: Maybe<Scalars['String']['output']>;
};

export type ItadDealInput = {
  country?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type ItadFreebie = {
  __typename?: 'ItadFreebie';
  discount: Scalars['Int']['output'];
  discounted: ItadPrice;
  drm: Array<Scalars['String']['output']>;
  expiry?: Maybe<Scalars['Timestamp']['output']>;
  id: Scalars['String']['output'];
  platforms: Array<Scalars['String']['output']>;
  regular: ItadPrice;
  slug: Scalars['String']['output'];
  store: Scalars['String']['output'];
  timestamp: Scalars['Timestamp']['output'];
  title: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
  voucher?: Maybe<Scalars['String']['output']>;
};

export type ItadHistoricalLow = {
  __typename?: 'ItadHistoricalLow';
  all?: Maybe<ItadPrice>;
  m3?: Maybe<ItadPrice>;
  y1?: Maybe<ItadPrice>;
};

export type ItadOverview = {
  __typename?: 'ItadOverview';
  appId: Scalars['Int']['output'];
  bundles: Array<ItadBundle>;
  deals: Array<ItadDeal>;
  hasAchievements: Scalars['Boolean']['output'];
  hasTradingCards: Scalars['Boolean']['output'];
  historicalLow: ItadHistoricalLow;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isEarlyAccess: Scalars['Boolean']['output'];
  playerCount?: Maybe<ItadPlayerCount>;
  releaseDate?: Maybe<Scalars['String']['output']>;
  reviews: Array<ItadReviews>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ItadPlayerCount = {
  __typename?: 'ItadPlayerCount';
  day: Scalars['Int']['output'];
  peak: Scalars['Int']['output'];
  recent: Scalars['Int']['output'];
  week: Scalars['Int']['output'];
};

export type ItadPrice = {
  __typename?: 'ItadPrice';
  amount: Scalars['Float']['output'];
  amountInt: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
};

export type ItadReviews = {
  __typename?: 'ItadReviews';
  count: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  source: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ItadSearchResult = {
  __typename?: 'ItadSearchResult';
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Mangadex = {
  __typename?: 'Mangadex';
  latestChapters: Array<MangadexMangaChapter>;
  manga: MangadexManga;
  search: Array<MangadexSearchResult>;
};


export type MangadexLatestChaptersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type MangadexMangaArgs = {
  id: Scalars['String']['input'];
};


export type MangadexSearchArgs = {
  query: Scalars['String']['input'];
};

export type MangadexChapter = {
  __typename?: 'MangadexChapter';
  id: Scalars['String']['output'];
  readableAt: Scalars['Timestamp']['output'];
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type MangadexManga = {
  __typename?: 'MangadexManga';
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  publication?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type MangadexMangaChapter = {
  __typename?: 'MangadexMangaChapter';
  chapter: MangadexChapter;
  mangaId: Scalars['String']['output'];
};

export type MangadexSearchResult = {
  __typename?: 'MangadexSearchResult';
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
  trackers: MangadexTrackers;
};

export type MangadexTrackers = {
  __typename?: 'MangadexTrackers';
  aniList?: Maybe<Scalars['String']['output']>;
  animePlanet?: Maybe<Scalars['String']['output']>;
  myAnimeList?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  aniList: AniList;
  animeSchedule: AnimeSchedule;
  hltb: Hltb;
  igdb: Igdb;
  itad: Itad;
  mangadex: Mangadex;
  reddit: Reddit;
  reviews: Reviews;
  steam: Steam;
  tmdb: Tmdb;
};

export type Reddit = {
  __typename?: 'Reddit';
  posts: Array<RedditPost>;
};


export type RedditPostsArgs = {
  input: RedditPostsInput;
};

export type RedditGalleryEntry = {
  __typename?: 'RedditGalleryEntry';
  url: Scalars['String']['output'];
};

export type RedditPost = {
  __typename?: 'RedditPost';
  gallery: Array<RedditGalleryEntry>;
  isCrosspost: Scalars['Boolean']['output'];
  isGallery: Scalars['Boolean']['output'];
  isImage: Scalars['Boolean']['output'];
  isNsfw: Scalars['Boolean']['output'];
  isSelf: Scalars['Boolean']['output'];
  isVideo: Scalars['Boolean']['output'];
  isYoutubeEmbed: Scalars['Boolean']['output'];
  publishedAt?: Maybe<Scalars['Date']['output']>;
  selftext?: Maybe<Scalars['String']['output']>;
  selfurl: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type RedditPostsInput = {
  flairs?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  subreddit: Scalars['String']['input'];
};

export type Review = {
  __typename?: 'Review';
  aggregateRating: ReviewAggregateRating;
  description: Scalars['String']['output'];
  developers: Array<Scalars['String']['output']>;
  genres: Array<Scalars['String']['output']>;
  image: Scalars['String']['output'];
  platforms: Array<Scalars['String']['output']>;
  publishers: Array<Scalars['String']['output']>;
  releaseDate: Scalars['Timestamp']['output'];
  title: Scalars['String']['output'];
  trailer?: Maybe<ReviewTrailer>;
  url: Scalars['String']['output'];
};

export type ReviewAggregateRating = {
  __typename?: 'ReviewAggregateRating';
  ratingValue: Scalars['Int']['output'];
  reviewCount: Scalars['Int']['output'];
  tier: Scalars['String']['output'];
};

export type ReviewTrailer = {
  __typename?: 'ReviewTrailer';
  description: Scalars['String']['output'];
  thumbnailUrl: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Reviews = {
  __typename?: 'Reviews';
  review: Review;
  search: Array<ReviewsSearchResult>;
};


export type ReviewsReviewArgs = {
  url: Scalars['String']['input'];
};


export type ReviewsSearchArgs = {
  query: Scalars['String']['input'];
};

export type ReviewsSearchResult = {
  __typename?: 'ReviewsSearchResult';
  score: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Steam = {
  __typename?: 'Steam';
  chart: Array<SteamChartEntry>;
  playerCount: Scalars['Int']['output'];
  profile: SteamProfile;
  recentlyPlayed: Array<SteamRecentlyPlayedEntry>;
  search: Array<SteamSearchResult>;
  steamId64?: Maybe<Scalars['String']['output']>;
  store: Array<SteamApp>;
  upcomingSales: SteamSales;
  wishlist: Array<SteamWishlistEntry>;
};


export type SteamChartArgs = {
  chart: SteamChartType;
};


export type SteamPlayerCountArgs = {
  appId: Scalars['Int']['input'];
};


export type SteamProfileArgs = {
  steamId64: Scalars['String']['input'];
};


export type SteamRecentlyPlayedArgs = {
  steamId64: Scalars['String']['input'];
};


export type SteamSearchArgs = {
  query: Scalars['String']['input'];
};


export type SteamSteamId64Args = {
  vanityUrl: Scalars['String']['input'];
};


export type SteamStoreArgs = {
  appIds: Array<Scalars['Int']['input']>;
};


export type SteamWishlistArgs = {
  steamId64: Scalars['String']['input'];
};

export type SteamApp = {
  __typename?: 'SteamApp';
  assets?: Maybe<SteamAppAssets>;
  description: Scalars['String']['output'];
  developers: Array<Scalars['String']['output']>;
  discount: Scalars['Int']['output'];
  discounted?: Maybe<Scalars['String']['output']>;
  franchises: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isFree: Scalars['Boolean']['output'];
  isGiftable: Scalars['Boolean']['output'];
  isReleased: Scalars['Boolean']['output'];
  publishers: Array<Scalars['String']['output']>;
  regular?: Maybe<Scalars['String']['output']>;
  release: SteamAppRelease;
  screenshots: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  trailers: Array<SteamAppTrailers>;
  url: Scalars['String']['output'];
};

export type SteamAppAssets = {
  __typename?: 'SteamAppAssets';
  background: Scalars['String']['output'];
  capsule: SteamAppCapsuleAssets;
  communityIcon: Scalars['String']['output'];
  header: Scalars['String']['output'];
  library: SteamAppLibraryAssets;
};

export type SteamAppCapsuleAssets = {
  __typename?: 'SteamAppCapsuleAssets';
  hero: Scalars['String']['output'];
  main: Scalars['String']['output'];
  small: Scalars['String']['output'];
};

export type SteamAppLibraryAssets = {
  __typename?: 'SteamAppLibraryAssets';
  capsule: Scalars['String']['output'];
  capsule2x: Scalars['String']['output'];
  hero: Scalars['String']['output'];
  hero2x: Scalars['String']['output'];
};

export type SteamAppRelease = {
  __typename?: 'SteamAppRelease';
  customMessage?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['Timestamp']['output']>;
};

export type SteamAppTrailer = {
  __typename?: 'SteamAppTrailer';
  max: Array<Scalars['String']['output']>;
  sd: Array<Scalars['String']['output']>;
};

export type SteamAppTrailers = {
  __typename?: 'SteamAppTrailers';
  title: Scalars['String']['output'];
  trailer: SteamAppTrailer;
};

export type SteamChartEntry = {
  __typename?: 'SteamChartEntry';
  count?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export enum SteamChartType {
  TopPlayed = 'TOP_PLAYED',
  TopSellers = 'TOP_SELLERS',
  UpcomingGames = 'UPCOMING_GAMES'
}

export type SteamProfile = {
  __typename?: 'SteamProfile';
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  logoutAt: Scalars['Timestamp']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type SteamRecentlyPlayedEntry = {
  __typename?: 'SteamRecentlyPlayedEntry';
  biweeklyHours: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalHours: Scalars['Float']['output'];
  url: Scalars['String']['output'];
};

export type SteamSales = {
  __typename?: 'SteamSales';
  sale?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  upcoming: Array<Scalars['String']['output']>;
};

export type SteamSearchResult = {
  __typename?: 'SteamSearchResult';
  appId: Scalars['Int']['output'];
  image: Scalars['String']['output'];
  price: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type SteamWishlistEntry = {
  __typename?: 'SteamWishlistEntry';
  assets?: Maybe<SteamAppAssets>;
  description: Scalars['String']['output'];
  developers: Array<Scalars['String']['output']>;
  discount: Scalars['Int']['output'];
  discounted?: Maybe<Scalars['String']['output']>;
  franchises: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isFree: Scalars['Boolean']['output'];
  isGiftable: Scalars['Boolean']['output'];
  isReleased: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  publishers: Array<Scalars['String']['output']>;
  regular?: Maybe<Scalars['String']['output']>;
  release: SteamAppRelease;
  screenshots: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  trailers: Array<SteamAppTrailers>;
  url: Scalars['String']['output'];
};

export type Tmdb = {
  __typename?: 'Tmdb';
  movie: TmdbMovie;
  search: Array<TmdbSearchResult>;
  series: TmdbSeries;
};


export type TmdbMovieArgs = {
  input: TmdbMediaInput;
};


export type TmdbSearchArgs = {
  query: Scalars['String']['input'];
};


export type TmdbSeriesArgs = {
  input: TmdbMediaInput;
};

export type TmdbMediaInput = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type TmdbMovie = {
  __typename?: 'TmdbMovie';
  duration?: Maybe<Scalars['String']['output']>;
  genres: Array<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  overview: Scalars['String']['output'];
  providers: TmdbProviders;
  releaseDate: Scalars['String']['output'];
  score?: Maybe<Scalars['String']['output']>;
  tagline: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type TmdbProviders = {
  __typename?: 'TmdbProviders';
  buy: Array<Scalars['String']['output']>;
  rent: Array<Scalars['String']['output']>;
  stream: Array<Scalars['String']['output']>;
};

export type TmdbSearchResult = {
  __typename?: 'TmdbSearchResult';
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type TmdbSeries = {
  __typename?: 'TmdbSeries';
  episodes: TmdbSeriesEpisodes;
  genres: Array<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  overview: Scalars['String']['output'];
  providers: TmdbProviders;
  score?: Maybe<Scalars['String']['output']>;
  seasons: Scalars['Int']['output'];
  tagline: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type TmdbSeriesEpisodes = {
  __typename?: 'TmdbSeriesEpisodes';
  duration?: Maybe<Scalars['String']['output']>;
  last: TmdbSeriesLastEpisode;
  next: TmdbSeriesNextEpisode;
  total: Scalars['Int']['output'];
};

export type TmdbSeriesLastEpisode = {
  __typename?: 'TmdbSeriesLastEpisode';
  date: Scalars['String']['output'];
};

export type TmdbSeriesNextEpisode = {
  __typename?: 'TmdbSeriesNextEpisode';
  date?: Maybe<Scalars['String']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AniList: ResolverTypeWrapper<AniList>;
  AniListAiringSchedule: ResolverTypeWrapper<AniListAiringSchedule>;
  AniListAiringScheduleInput: AniListAiringScheduleInput;
  AniListBrowseInput: AniListBrowseInput;
  AniListCharacter: ResolverTypeWrapper<AniListCharacter>;
  AniListCharacterMediaConnection: ResolverTypeWrapper<AniListCharacterMediaConnection>;
  AniListCharacterPage: ResolverTypeWrapper<AniListCharacterPage>;
  AniListCharacterPageInput: AniListCharacterPageInput;
  AniListCharacterWithConnections: ResolverTypeWrapper<AniListCharacterWithConnections>;
  AniListCharactersPage: ResolverTypeWrapper<AniListCharactersPage>;
  AniListCharactersSearchResult: ResolverTypeWrapper<AniListCharactersSearchResult>;
  AniListCoverImage: ResolverTypeWrapper<AniListCoverImage>;
  AniListEpisode: ResolverTypeWrapper<AniListEpisode>;
  AniListFuzzyDate: ResolverTypeWrapper<AniListFuzzyDate>;
  AniListMedia: ResolverTypeWrapper<AniListMedia>;
  AniListMediaCharactersConnection: ResolverTypeWrapper<AniListMediaCharactersConnection>;
  AniListMediaInput: AniListMediaInput;
  AniListMediaPage: ResolverTypeWrapper<AniListMediaPage>;
  AniListMediaRecommendationsConnection: ResolverTypeWrapper<AniListMediaRecommendationsConnection>;
  AniListMediaRecommendationsPage: ResolverTypeWrapper<AniListMediaRecommendationsPage>;
  AniListMediaRelationsConnection: ResolverTypeWrapper<AniListMediaRelationsConnection>;
  AniListMediaSearchResult: ResolverTypeWrapper<AniListMediaSearchResult>;
  AniListMediaStaffConnection: ResolverTypeWrapper<AniListMediaStaffConnection>;
  AniListMediaStudiosConnection: ResolverTypeWrapper<AniListMediaStudiosConnection>;
  AniListMediaType: AniListMediaType;
  AniListMediaWithConnections: ResolverTypeWrapper<AniListMediaWithConnections>;
  AniListMultiSearchResult: ResolverTypeWrapper<AniListMultiSearchResult>;
  AniListPageInfo: ResolverTypeWrapper<AniListPageInfo>;
  AniListPageInput: AniListPageInput;
  AniListRanking: ResolverTypeWrapper<AniListRanking>;
  AniListSearchInput: AniListSearchInput;
  AniListStaff: ResolverTypeWrapper<AniListStaff>;
  AniListStaffCharactersConnection: ResolverTypeWrapper<AniListStaffCharactersConnection>;
  AniListStaffMemberPageInput: AniListStaffMemberPageInput;
  AniListStaffMembersPage: ResolverTypeWrapper<AniListStaffMembersPage>;
  AniListStaffProductionConnection: ResolverTypeWrapper<AniListStaffProductionConnection>;
  AniListStaffProductionPage: ResolverTypeWrapper<AniListStaffProductionPage>;
  AniListStaffSearchResult: ResolverTypeWrapper<AniListStaffSearchResult>;
  AniListStaffVoiceActingConnection: ResolverTypeWrapper<AniListStaffVoiceActingConnection>;
  AniListStaffVoiceActingPage: ResolverTypeWrapper<AniListStaffVoiceActingPage>;
  AniListStaffWithConnections: ResolverTypeWrapper<AniListStaffWithConnections>;
  AniListStream: ResolverTypeWrapper<AniListStream>;
  AniListStudio: ResolverTypeWrapper<AniListStudio>;
  AniListStudioMediaConnection: ResolverTypeWrapper<AniListStudioMediaConnection>;
  AniListStudioPage: ResolverTypeWrapper<AniListStudioPage>;
  AniListStudioWithConnections: ResolverTypeWrapper<AniListStudioWithConnections>;
  AniListStudiosSearchResult: ResolverTypeWrapper<AniListStudiosSearchResult>;
  AniListTag: ResolverTypeWrapper<AniListTag>;
  AniListTitle: ResolverTypeWrapper<AniListTitle>;
  AniListTracker: ResolverTypeWrapper<AniListTracker>;
  AniListTrailer: ResolverTypeWrapper<AniListTrailer>;
  AnimeSchedule: ResolverTypeWrapper<AnimeSchedule>;
  AnimeScheduleAiringEpisode: ResolverTypeWrapper<AnimeScheduleAiringEpisode>;
  AnimeScheduleAiringEpisodeDelay: ResolverTypeWrapper<AnimeScheduleAiringEpisodeDelay>;
  AnimeScheduleAiringSchedule: ResolverTypeWrapper<AnimeScheduleAiringSchedule>;
  AnimeScheduleAiringScheduleInput: AnimeScheduleAiringScheduleInput;
  AnimeScheduleTitle: ResolverTypeWrapper<AnimeScheduleTitle>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Hltb: ResolverTypeWrapper<Hltb>;
  HltbPlaytimes: ResolverTypeWrapper<HltbPlaytimes>;
  HltbSearchResult: ResolverTypeWrapper<HltbSearchResult>;
  Igdb: ResolverTypeWrapper<Igdb>;
  IgdbGamingEvent: ResolverTypeWrapper<IgdbGamingEvent>;
  IgdbGamingEventUrl: ResolverTypeWrapper<IgdbGamingEventUrl>;
  IgdbSearchResult: ResolverTypeWrapper<IgdbSearchResult>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Itad: ResolverTypeWrapper<Itad>;
  ItadBundle: ResolverTypeWrapper<ItadBundle>;
  ItadBundleTier: ResolverTypeWrapper<ItadBundleTier>;
  ItadBundleTierGame: ResolverTypeWrapper<ItadBundleTierGame>;
  ItadDeal: ResolverTypeWrapper<ItadDeal>;
  ItadDealInput: ItadDealInput;
  ItadFreebie: ResolverTypeWrapper<ItadFreebie>;
  ItadHistoricalLow: ResolverTypeWrapper<ItadHistoricalLow>;
  ItadOverview: ResolverTypeWrapper<ItadOverview>;
  ItadPlayerCount: ResolverTypeWrapper<ItadPlayerCount>;
  ItadPrice: ResolverTypeWrapper<ItadPrice>;
  ItadReviews: ResolverTypeWrapper<ItadReviews>;
  ItadSearchResult: ResolverTypeWrapper<ItadSearchResult>;
  Mangadex: ResolverTypeWrapper<Mangadex>;
  MangadexChapter: ResolverTypeWrapper<MangadexChapter>;
  MangadexManga: ResolverTypeWrapper<MangadexManga>;
  MangadexMangaChapter: ResolverTypeWrapper<MangadexMangaChapter>;
  MangadexSearchResult: ResolverTypeWrapper<MangadexSearchResult>;
  MangadexTrackers: ResolverTypeWrapper<MangadexTrackers>;
  Query: ResolverTypeWrapper<{}>;
  Reddit: ResolverTypeWrapper<Reddit>;
  RedditGalleryEntry: ResolverTypeWrapper<RedditGalleryEntry>;
  RedditPost: ResolverTypeWrapper<RedditPost>;
  RedditPostsInput: RedditPostsInput;
  Review: ResolverTypeWrapper<Review>;
  ReviewAggregateRating: ResolverTypeWrapper<ReviewAggregateRating>;
  ReviewTrailer: ResolverTypeWrapper<ReviewTrailer>;
  Reviews: ResolverTypeWrapper<Reviews>;
  ReviewsSearchResult: ResolverTypeWrapper<ReviewsSearchResult>;
  Steam: ResolverTypeWrapper<Steam>;
  SteamApp: ResolverTypeWrapper<SteamApp>;
  SteamAppAssets: ResolverTypeWrapper<SteamAppAssets>;
  SteamAppCapsuleAssets: ResolverTypeWrapper<SteamAppCapsuleAssets>;
  SteamAppLibraryAssets: ResolverTypeWrapper<SteamAppLibraryAssets>;
  SteamAppRelease: ResolverTypeWrapper<SteamAppRelease>;
  SteamAppTrailer: ResolverTypeWrapper<SteamAppTrailer>;
  SteamAppTrailers: ResolverTypeWrapper<SteamAppTrailers>;
  SteamChartEntry: ResolverTypeWrapper<SteamChartEntry>;
  SteamChartType: SteamChartType;
  SteamProfile: ResolverTypeWrapper<SteamProfile>;
  SteamRecentlyPlayedEntry: ResolverTypeWrapper<SteamRecentlyPlayedEntry>;
  SteamSales: ResolverTypeWrapper<SteamSales>;
  SteamSearchResult: ResolverTypeWrapper<SteamSearchResult>;
  SteamWishlistEntry: ResolverTypeWrapper<SteamWishlistEntry>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  Tmdb: ResolverTypeWrapper<Tmdb>;
  TmdbMediaInput: TmdbMediaInput;
  TmdbMovie: ResolverTypeWrapper<TmdbMovie>;
  TmdbProviders: ResolverTypeWrapper<TmdbProviders>;
  TmdbSearchResult: ResolverTypeWrapper<TmdbSearchResult>;
  TmdbSeries: ResolverTypeWrapper<TmdbSeries>;
  TmdbSeriesEpisodes: ResolverTypeWrapper<TmdbSeriesEpisodes>;
  TmdbSeriesLastEpisode: ResolverTypeWrapper<TmdbSeriesLastEpisode>;
  TmdbSeriesNextEpisode: ResolverTypeWrapper<TmdbSeriesNextEpisode>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AniList: AniList;
  AniListAiringSchedule: AniListAiringSchedule;
  AniListAiringScheduleInput: AniListAiringScheduleInput;
  AniListBrowseInput: AniListBrowseInput;
  AniListCharacter: AniListCharacter;
  AniListCharacterMediaConnection: AniListCharacterMediaConnection;
  AniListCharacterPage: AniListCharacterPage;
  AniListCharacterPageInput: AniListCharacterPageInput;
  AniListCharacterWithConnections: AniListCharacterWithConnections;
  AniListCharactersPage: AniListCharactersPage;
  AniListCharactersSearchResult: AniListCharactersSearchResult;
  AniListCoverImage: AniListCoverImage;
  AniListEpisode: AniListEpisode;
  AniListFuzzyDate: AniListFuzzyDate;
  AniListMedia: AniListMedia;
  AniListMediaCharactersConnection: AniListMediaCharactersConnection;
  AniListMediaInput: AniListMediaInput;
  AniListMediaPage: AniListMediaPage;
  AniListMediaRecommendationsConnection: AniListMediaRecommendationsConnection;
  AniListMediaRecommendationsPage: AniListMediaRecommendationsPage;
  AniListMediaRelationsConnection: AniListMediaRelationsConnection;
  AniListMediaSearchResult: AniListMediaSearchResult;
  AniListMediaStaffConnection: AniListMediaStaffConnection;
  AniListMediaStudiosConnection: AniListMediaStudiosConnection;
  AniListMediaWithConnections: AniListMediaWithConnections;
  AniListMultiSearchResult: AniListMultiSearchResult;
  AniListPageInfo: AniListPageInfo;
  AniListPageInput: AniListPageInput;
  AniListRanking: AniListRanking;
  AniListSearchInput: AniListSearchInput;
  AniListStaff: AniListStaff;
  AniListStaffCharactersConnection: AniListStaffCharactersConnection;
  AniListStaffMemberPageInput: AniListStaffMemberPageInput;
  AniListStaffMembersPage: AniListStaffMembersPage;
  AniListStaffProductionConnection: AniListStaffProductionConnection;
  AniListStaffProductionPage: AniListStaffProductionPage;
  AniListStaffSearchResult: AniListStaffSearchResult;
  AniListStaffVoiceActingConnection: AniListStaffVoiceActingConnection;
  AniListStaffVoiceActingPage: AniListStaffVoiceActingPage;
  AniListStaffWithConnections: AniListStaffWithConnections;
  AniListStream: AniListStream;
  AniListStudio: AniListStudio;
  AniListStudioMediaConnection: AniListStudioMediaConnection;
  AniListStudioPage: AniListStudioPage;
  AniListStudioWithConnections: AniListStudioWithConnections;
  AniListStudiosSearchResult: AniListStudiosSearchResult;
  AniListTag: AniListTag;
  AniListTitle: AniListTitle;
  AniListTracker: AniListTracker;
  AniListTrailer: AniListTrailer;
  AnimeSchedule: AnimeSchedule;
  AnimeScheduleAiringEpisode: AnimeScheduleAiringEpisode;
  AnimeScheduleAiringEpisodeDelay: AnimeScheduleAiringEpisodeDelay;
  AnimeScheduleAiringSchedule: AnimeScheduleAiringSchedule;
  AnimeScheduleAiringScheduleInput: AnimeScheduleAiringScheduleInput;
  AnimeScheduleTitle: AnimeScheduleTitle;
  Boolean: Scalars['Boolean']['output'];
  Date: Scalars['Date']['output'];
  Float: Scalars['Float']['output'];
  Hltb: Hltb;
  HltbPlaytimes: HltbPlaytimes;
  HltbSearchResult: HltbSearchResult;
  Igdb: Igdb;
  IgdbGamingEvent: IgdbGamingEvent;
  IgdbGamingEventUrl: IgdbGamingEventUrl;
  IgdbSearchResult: IgdbSearchResult;
  Int: Scalars['Int']['output'];
  Itad: Itad;
  ItadBundle: ItadBundle;
  ItadBundleTier: ItadBundleTier;
  ItadBundleTierGame: ItadBundleTierGame;
  ItadDeal: ItadDeal;
  ItadDealInput: ItadDealInput;
  ItadFreebie: ItadFreebie;
  ItadHistoricalLow: ItadHistoricalLow;
  ItadOverview: ItadOverview;
  ItadPlayerCount: ItadPlayerCount;
  ItadPrice: ItadPrice;
  ItadReviews: ItadReviews;
  ItadSearchResult: ItadSearchResult;
  Mangadex: Mangadex;
  MangadexChapter: MangadexChapter;
  MangadexManga: MangadexManga;
  MangadexMangaChapter: MangadexMangaChapter;
  MangadexSearchResult: MangadexSearchResult;
  MangadexTrackers: MangadexTrackers;
  Query: {};
  Reddit: Reddit;
  RedditGalleryEntry: RedditGalleryEntry;
  RedditPost: RedditPost;
  RedditPostsInput: RedditPostsInput;
  Review: Review;
  ReviewAggregateRating: ReviewAggregateRating;
  ReviewTrailer: ReviewTrailer;
  Reviews: Reviews;
  ReviewsSearchResult: ReviewsSearchResult;
  Steam: Steam;
  SteamApp: SteamApp;
  SteamAppAssets: SteamAppAssets;
  SteamAppCapsuleAssets: SteamAppCapsuleAssets;
  SteamAppLibraryAssets: SteamAppLibraryAssets;
  SteamAppRelease: SteamAppRelease;
  SteamAppTrailer: SteamAppTrailer;
  SteamAppTrailers: SteamAppTrailers;
  SteamChartEntry: SteamChartEntry;
  SteamProfile: SteamProfile;
  SteamRecentlyPlayedEntry: SteamRecentlyPlayedEntry;
  SteamSales: SteamSales;
  SteamSearchResult: SteamSearchResult;
  SteamWishlistEntry: SteamWishlistEntry;
  String: Scalars['String']['output'];
  Timestamp: Scalars['Timestamp']['output'];
  Tmdb: Tmdb;
  TmdbMediaInput: TmdbMediaInput;
  TmdbMovie: TmdbMovie;
  TmdbProviders: TmdbProviders;
  TmdbSearchResult: TmdbSearchResult;
  TmdbSeries: TmdbSeries;
  TmdbSeriesEpisodes: TmdbSeriesEpisodes;
  TmdbSeriesLastEpisode: TmdbSeriesLastEpisode;
  TmdbSeriesNextEpisode: TmdbSeriesNextEpisode;
};

export type AniListResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniList'] = ResolversParentTypes['AniList']> = {
  airingSchedule?: Resolver<Array<ResolversTypes['AniListAiringSchedule']>, ParentType, ContextType, Partial<AniListAiringScheduleArgs>>;
  browse?: Resolver<ResolversTypes['AniListMediaPage'], ParentType, ContextType, Partial<AniListBrowseArgs>>;
  character?: Resolver<ResolversTypes['AniListCharacterWithConnections'], ParentType, ContextType, RequireFields<AniListCharacterArgs, 'input'>>;
  characters?: Resolver<ResolversTypes['AniListCharactersPage'], ParentType, ContextType, RequireFields<AniListCharactersArgs, 'input'>>;
  genres?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListMediaWithConnections'], ParentType, ContextType, RequireFields<AniListMediaArgs, 'input'>>;
  recommendations?: Resolver<ResolversTypes['AniListMediaRecommendationsPage'], ParentType, ContextType, RequireFields<AniListRecommendationsArgs, 'input'>>;
  search?: Resolver<ResolversTypes['AniListMultiSearchResult'], ParentType, ContextType, RequireFields<AniListSearchArgs, 'input'>>;
  staffMember?: Resolver<ResolversTypes['AniListStaffWithConnections'], ParentType, ContextType, RequireFields<AniListStaffMemberArgs, 'input'>>;
  staffMembers?: Resolver<ResolversTypes['AniListStaffMembersPage'], ParentType, ContextType, RequireFields<AniListStaffMembersArgs, 'input'>>;
  studio?: Resolver<ResolversTypes['AniListStudioWithConnections'], ParentType, ContextType, RequireFields<AniListStudioArgs, 'input'>>;
  tags?: Resolver<Array<ResolversTypes['AniListTag']>, ParentType, ContextType>;
  trending?: Resolver<ResolversTypes['AniListMediaPage'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListAiringScheduleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListAiringSchedule'] = ResolversParentTypes['AniListAiringSchedule']> = {
  airingAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  episode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListMediaWithConnections'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCharacterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCharacter'] = ResolversParentTypes['AniListCharacter']> = {
  age?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bloodType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['AniListFuzzyDate'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCharacterMediaConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCharacterMediaConnection'] = ResolversParentTypes['AniListCharacterMediaConnection']> = {
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  staff?: Resolver<Array<ResolversTypes['AniListStaff']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCharacterPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCharacterPage'] = ResolversParentTypes['AniListCharacterPage']> = {
  media?: Resolver<Array<ResolversTypes['AniListCharacterMediaConnection']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCharacterWithConnectionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCharacterWithConnections'] = ResolversParentTypes['AniListCharacterWithConnections']> = {
  age?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bloodType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['AniListFuzzyDate'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListCharacterPage'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCharactersPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCharactersPage'] = ResolversParentTypes['AniListCharactersPage']> = {
  characters?: Resolver<Array<ResolversTypes['AniListMediaCharactersConnection']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCharactersSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCharactersSearchResult'] = ResolversParentTypes['AniListCharactersSearchResult']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  results?: Resolver<Maybe<Array<Maybe<ResolversTypes['AniListCharacter']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListCoverImageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListCoverImage'] = ResolversParentTypes['AniListCoverImage']> = {
  extraLarge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListEpisodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListEpisode'] = ResolversParentTypes['AniListEpisode']> = {
  airingAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListFuzzyDateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListFuzzyDate'] = ResolversParentTypes['AniListFuzzyDate']> = {
  day?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMedia'] = ResolversParentTypes['AniListMedia']> = {
  averageScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bannerImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chapters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  countryOfOrigin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  coverImage?: Resolver<ResolversTypes['AniListCoverImage'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['AniListFuzzyDate']>, ParentType, ContextType>;
  episodes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isLicensed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isMature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  malId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextAiringEpisode?: Resolver<ResolversTypes['AniListEpisode'], ParentType, ContextType>;
  popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rankings?: Resolver<Array<ResolversTypes['AniListRanking']>, ParentType, ContextType>;
  season?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seasonYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['AniListFuzzyDate']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  streams?: Resolver<Array<ResolversTypes['AniListStream']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['AniListTitle'], ParentType, ContextType>;
  trackers?: Resolver<Array<ResolversTypes['AniListTracker']>, ParentType, ContextType>;
  trailer?: Resolver<ResolversTypes['AniListTrailer'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AniListMediaType'], ParentType, ContextType>;
  volumes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaCharactersConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaCharactersConnection'] = ResolversParentTypes['AniListMediaCharactersConnection']> = {
  character?: Resolver<ResolversTypes['AniListCharacter'], ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voiceActors?: Resolver<Array<ResolversTypes['AniListStaff']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaPage'] = ResolversParentTypes['AniListMediaPage']> = {
  media?: Resolver<Array<ResolversTypes['AniListMediaWithConnections']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaRecommendationsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaRecommendationsConnection'] = ResolversParentTypes['AniListMediaRecommendationsConnection']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaRecommendationsPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaRecommendationsPage'] = ResolversParentTypes['AniListMediaRecommendationsPage']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  recommendations?: Resolver<Array<ResolversTypes['AniListMediaRecommendationsConnection']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaRelationsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaRelationsConnection'] = ResolversParentTypes['AniListMediaRelationsConnection']> = {
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  relationType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaSearchResult'] = ResolversParentTypes['AniListMediaSearchResult']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  results?: Resolver<Maybe<Array<Maybe<ResolversTypes['AniListMedia']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaStaffConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaStaffConnection'] = ResolversParentTypes['AniListMediaStaffConnection']> = {
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  staff?: Resolver<ResolversTypes['AniListStaff'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaStudiosConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaStudiosConnection'] = ResolversParentTypes['AniListMediaStudiosConnection']> = {
  isMain?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  studio?: Resolver<ResolversTypes['AniListStudio'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMediaWithConnectionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMediaWithConnections'] = ResolversParentTypes['AniListMediaWithConnections']> = {
  averageScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bannerImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chapters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  characters?: Resolver<Array<ResolversTypes['AniListMediaCharactersConnection']>, ParentType, ContextType>;
  countryOfOrigin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  coverImage?: Resolver<ResolversTypes['AniListCoverImage'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['AniListFuzzyDate']>, ParentType, ContextType>;
  episodes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isLicensed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isMature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  malId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextAiringEpisode?: Resolver<ResolversTypes['AniListEpisode'], ParentType, ContextType>;
  popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rankings?: Resolver<Array<ResolversTypes['AniListRanking']>, ParentType, ContextType>;
  recommendations?: Resolver<Array<ResolversTypes['AniListMediaRecommendationsConnection']>, ParentType, ContextType>;
  relations?: Resolver<Array<ResolversTypes['AniListMediaRelationsConnection']>, ParentType, ContextType>;
  season?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seasonYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  staff?: Resolver<Array<ResolversTypes['AniListMediaStaffConnection']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['AniListFuzzyDate']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  streams?: Resolver<Array<ResolversTypes['AniListStream']>, ParentType, ContextType>;
  studios?: Resolver<Array<ResolversTypes['AniListMediaStudiosConnection']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['AniListTitle'], ParentType, ContextType>;
  trackers?: Resolver<Array<ResolversTypes['AniListTracker']>, ParentType, ContextType>;
  trailer?: Resolver<ResolversTypes['AniListTrailer'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AniListMediaType'], ParentType, ContextType>;
  volumes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListMultiSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListMultiSearchResult'] = ResolversParentTypes['AniListMultiSearchResult']> = {
  anime?: Resolver<ResolversTypes['AniListMediaSearchResult'], ParentType, ContextType>;
  characters?: Resolver<ResolversTypes['AniListCharactersSearchResult'], ParentType, ContextType>;
  manga?: Resolver<ResolversTypes['AniListMediaSearchResult'], ParentType, ContextType>;
  staff?: Resolver<ResolversTypes['AniListStaffSearchResult'], ParentType, ContextType>;
  studios?: Resolver<ResolversTypes['AniListStudiosSearchResult'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListPageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListPageInfo'] = ResolversParentTypes['AniListPageInfo']> = {
  currentPage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastPage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  perPage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListRankingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListRanking'] = ResolversParentTypes['AniListRanking']> = {
  allTime?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  context?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  format?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  formatted?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  season?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaff'] = ResolversParentTypes['AniListStaff']> = {
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bloodType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['AniListFuzzyDate'], ParentType, ContextType>;
  dateOfDeath?: Resolver<ResolversTypes['AniListFuzzyDate'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  homeTown?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryOccupations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  yearsActive?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffCharactersConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffCharactersConnection'] = ResolversParentTypes['AniListStaffCharactersConnection']> = {
  characters?: Resolver<Array<ResolversTypes['AniListCharacter']>, ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffMembersPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffMembersPage'] = ResolversParentTypes['AniListStaffMembersPage']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  staff?: Resolver<Array<ResolversTypes['AniListMediaStaffConnection']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffProductionConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffProductionConnection'] = ResolversParentTypes['AniListStaffProductionConnection']> = {
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffProductionPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffProductionPage'] = ResolversParentTypes['AniListStaffProductionPage']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['AniListStaffProductionConnection']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffSearchResult'] = ResolversParentTypes['AniListStaffSearchResult']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  results?: Resolver<Maybe<Array<Maybe<ResolversTypes['AniListStaff']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffVoiceActingConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffVoiceActingConnection'] = ResolversParentTypes['AniListStaffVoiceActingConnection']> = {
  characters?: Resolver<Array<ResolversTypes['AniListCharacter']>, ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffVoiceActingPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffVoiceActingPage'] = ResolversParentTypes['AniListStaffVoiceActingPage']> = {
  characters?: Resolver<Array<ResolversTypes['AniListStaffVoiceActingConnection']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStaffWithConnectionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStaffWithConnections'] = ResolversParentTypes['AniListStaffWithConnections']> = {
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bloodType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['AniListFuzzyDate'], ParentType, ContextType>;
  dateOfDeath?: Resolver<ResolversTypes['AniListFuzzyDate'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  homeTown?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryOccupations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  production?: Resolver<ResolversTypes['AniListStaffProductionPage'], ParentType, ContextType>;
  voiceActing?: Resolver<ResolversTypes['AniListStaffVoiceActingPage'], ParentType, ContextType>;
  yearsActive?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStreamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStream'] = ResolversParentTypes['AniListStream']> = {
  iconUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStudioResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStudio'] = ResolversParentTypes['AniListStudio']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isAnimationStudio?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStudioMediaConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStudioMediaConnection'] = ResolversParentTypes['AniListStudioMediaConnection']> = {
  isMainStudio?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListMedia'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStudioPageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStudioPage'] = ResolversParentTypes['AniListStudioPage']> = {
  media?: Resolver<Array<ResolversTypes['AniListStudioMediaConnection']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStudioWithConnectionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStudioWithConnections'] = ResolversParentTypes['AniListStudioWithConnections']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isAnimationStudio?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  media?: Resolver<ResolversTypes['AniListStudioPage'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListStudiosSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListStudiosSearchResult'] = ResolversParentTypes['AniListStudiosSearchResult']> = {
  pageInfo?: Resolver<ResolversTypes['AniListPageInfo'], ParentType, ContextType>;
  results?: Resolver<Maybe<Array<Maybe<ResolversTypes['AniListStudio']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListTagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListTag'] = ResolversParentTypes['AniListTag']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isAdult?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListTitleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListTitle'] = ResolversParentTypes['AniListTitle']> = {
  english?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  native?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  romaji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListTrackerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListTracker'] = ResolversParentTypes['AniListTracker']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AniListTrailerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AniListTrailer'] = ResolversParentTypes['AniListTrailer']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnimeScheduleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnimeSchedule'] = ResolversParentTypes['AnimeSchedule']> = {
  airingSchedule?: Resolver<Array<ResolversTypes['AnimeScheduleAiringSchedule']>, ParentType, ContextType, Partial<AnimeScheduleAiringScheduleArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnimeScheduleAiringEpisodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnimeScheduleAiringEpisode'] = ResolversParentTypes['AnimeScheduleAiringEpisode']> = {
  airingAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  delay?: Resolver<ResolversTypes['AnimeScheduleAiringEpisodeDelay'], ParentType, ContextType>;
  episode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnimeScheduleAiringEpisodeDelayResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnimeScheduleAiringEpisodeDelay'] = ResolversParentTypes['AnimeScheduleAiringEpisodeDelay']> = {
  from?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  to?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnimeScheduleAiringScheduleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnimeScheduleAiringSchedule'] = ResolversParentTypes['AnimeScheduleAiringSchedule']> = {
  airing?: Resolver<ResolversTypes['AnimeScheduleAiringEpisode'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  episodes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasAired?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isAiring?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isDelayed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['AnimeScheduleTitle'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnimeScheduleTitleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AnimeScheduleTitle'] = ResolversParentTypes['AnimeScheduleTitle']> = {
  default?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  english?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  romaji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type HltbResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Hltb'] = ResolversParentTypes['Hltb']> = {
  playtimes?: Resolver<ResolversTypes['HltbPlaytimes'], ParentType, ContextType, RequireFields<HltbPlaytimesArgs, 'id'>>;
  search?: Resolver<Array<ResolversTypes['HltbSearchResult']>, ParentType, ContextType, RequireFields<HltbSearchArgs, 'query'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HltbPlaytimesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['HltbPlaytimes'] = ResolversParentTypes['HltbPlaytimes']> = {
  completionist?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  main?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mainExtra?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HltbSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['HltbSearchResult'] = ResolversParentTypes['HltbSearchResult']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  releaseYear?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IgdbResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Igdb'] = ResolversParentTypes['Igdb']> = {
  search?: Resolver<Array<ResolversTypes['IgdbSearchResult']>, ParentType, ContextType, RequireFields<IgdbSearchArgs, 'query'>>;
  upcomingEvents?: Resolver<Array<ResolversTypes['IgdbGamingEvent']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IgdbGamingEventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IgdbGamingEvent'] = ResolversParentTypes['IgdbGamingEvent']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scheduledEndAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  scheduledStartAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['IgdbGamingEventUrl'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IgdbGamingEventUrlResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IgdbGamingEventUrl'] = ResolversParentTypes['IgdbGamingEventUrl']> = {
  twitch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  youtube?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IgdbSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IgdbSearchResult'] = ResolversParentTypes['IgdbSearchResult']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Itad'] = ResolversParentTypes['Itad']> = {
  deal?: Resolver<ResolversTypes['ItadOverview'], ParentType, ContextType, RequireFields<ItadDealArgs, 'input'>>;
  freebies?: Resolver<Array<ResolversTypes['ItadFreebie']>, ParentType, ContextType, RequireFields<ItadFreebiesArgs, 'country'>>;
  search?: Resolver<Array<ResolversTypes['ItadSearchResult']>, ParentType, ContextType, RequireFields<ItadSearchArgs, 'query'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadBundleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadBundle'] = ResolversParentTypes['ItadBundle']> = {
  expiry?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  store?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tiers?: Resolver<Array<ResolversTypes['ItadBundleTier']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadBundleTierResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadBundleTier'] = ResolversParentTypes['ItadBundleTier']> = {
  games?: Resolver<Array<ResolversTypes['ItadBundleTierGame']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['ItadPrice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadBundleTierGameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadBundleTierGame'] = ResolversParentTypes['ItadBundleTierGame']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadDealResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadDeal'] = ResolversParentTypes['ItadDeal']> = {
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  discounted?: Resolver<ResolversTypes['ItadPrice'], ParentType, ContextType>;
  drm?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  expiry?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  platforms?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  regular?: Resolver<ResolversTypes['ItadPrice'], ParentType, ContextType>;
  store?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  storeHistoricalLow?: Resolver<Maybe<ResolversTypes['ItadPrice']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  voucher?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadFreebieResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadFreebie'] = ResolversParentTypes['ItadFreebie']> = {
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  discounted?: Resolver<ResolversTypes['ItadPrice'], ParentType, ContextType>;
  drm?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  expiry?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platforms?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  regular?: Resolver<ResolversTypes['ItadPrice'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  store?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  voucher?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadHistoricalLowResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadHistoricalLow'] = ResolversParentTypes['ItadHistoricalLow']> = {
  all?: Resolver<Maybe<ResolversTypes['ItadPrice']>, ParentType, ContextType>;
  m3?: Resolver<Maybe<ResolversTypes['ItadPrice']>, ParentType, ContextType>;
  y1?: Resolver<Maybe<ResolversTypes['ItadPrice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadOverviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadOverview'] = ResolversParentTypes['ItadOverview']> = {
  appId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bundles?: Resolver<Array<ResolversTypes['ItadBundle']>, ParentType, ContextType>;
  deals?: Resolver<Array<ResolversTypes['ItadDeal']>, ParentType, ContextType>;
  hasAchievements?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasTradingCards?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  historicalLow?: Resolver<ResolversTypes['ItadHistoricalLow'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isEarlyAccess?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  playerCount?: Resolver<Maybe<ResolversTypes['ItadPlayerCount']>, ParentType, ContextType>;
  releaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviews?: Resolver<Array<ResolversTypes['ItadReviews']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadPlayerCountResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadPlayerCount'] = ResolversParentTypes['ItadPlayerCount']> = {
  day?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  peak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  recent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  week?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadPriceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadPrice'] = ResolversParentTypes['ItadPrice']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountInt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadReviewsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadReviews'] = ResolversParentTypes['ItadReviews']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  score?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItadSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItadSearchResult'] = ResolversParentTypes['ItadSearchResult']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MangadexResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mangadex'] = ResolversParentTypes['Mangadex']> = {
  latestChapters?: Resolver<Array<ResolversTypes['MangadexMangaChapter']>, ParentType, ContextType, RequireFields<MangadexLatestChaptersArgs, 'limit'>>;
  manga?: Resolver<ResolversTypes['MangadexManga'], ParentType, ContextType, RequireFields<MangadexMangaArgs, 'id'>>;
  search?: Resolver<Array<ResolversTypes['MangadexSearchResult']>, ParentType, ContextType, RequireFields<MangadexSearchArgs, 'query'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MangadexChapterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MangadexChapter'] = ResolversParentTypes['MangadexChapter']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readableAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MangadexMangaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MangadexManga'] = ResolversParentTypes['MangadexManga']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publication?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MangadexMangaChapterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MangadexMangaChapter'] = ResolversParentTypes['MangadexMangaChapter']> = {
  chapter?: Resolver<ResolversTypes['MangadexChapter'], ParentType, ContextType>;
  mangaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MangadexSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MangadexSearchResult'] = ResolversParentTypes['MangadexSearchResult']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trackers?: Resolver<ResolversTypes['MangadexTrackers'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MangadexTrackersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MangadexTrackers'] = ResolversParentTypes['MangadexTrackers']> = {
  aniList?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  animePlanet?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  myAnimeList?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  aniList?: Resolver<ResolversTypes['AniList'], ParentType, ContextType>;
  animeSchedule?: Resolver<ResolversTypes['AnimeSchedule'], ParentType, ContextType>;
  hltb?: Resolver<ResolversTypes['Hltb'], ParentType, ContextType>;
  igdb?: Resolver<ResolversTypes['Igdb'], ParentType, ContextType>;
  itad?: Resolver<ResolversTypes['Itad'], ParentType, ContextType>;
  mangadex?: Resolver<ResolversTypes['Mangadex'], ParentType, ContextType>;
  reddit?: Resolver<ResolversTypes['Reddit'], ParentType, ContextType>;
  reviews?: Resolver<ResolversTypes['Reviews'], ParentType, ContextType>;
  steam?: Resolver<ResolversTypes['Steam'], ParentType, ContextType>;
  tmdb?: Resolver<ResolversTypes['Tmdb'], ParentType, ContextType>;
};

export type RedditResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Reddit'] = ResolversParentTypes['Reddit']> = {
  posts?: Resolver<Array<ResolversTypes['RedditPost']>, ParentType, ContextType, RequireFields<RedditPostsArgs, 'input'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RedditGalleryEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RedditGalleryEntry'] = ResolversParentTypes['RedditGalleryEntry']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RedditPostResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RedditPost'] = ResolversParentTypes['RedditPost']> = {
  gallery?: Resolver<Array<ResolversTypes['RedditGalleryEntry']>, ParentType, ContextType>;
  isCrosspost?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isGallery?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isImage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNsfw?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isSelf?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isVideo?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isYoutubeEmbed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  selftext?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  selfurl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Review'] = ResolversParentTypes['Review']> = {
  aggregateRating?: Resolver<ResolversTypes['ReviewAggregateRating'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  developers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platforms?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  publishers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  releaseDate?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trailer?: Resolver<Maybe<ResolversTypes['ReviewTrailer']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReviewAggregateRatingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReviewAggregateRating'] = ResolversParentTypes['ReviewAggregateRating']> = {
  ratingValue?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reviewCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReviewTrailerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReviewTrailer'] = ResolversParentTypes['ReviewTrailer']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnailUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReviewsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Reviews'] = ResolversParentTypes['Reviews']> = {
  review?: Resolver<ResolversTypes['Review'], ParentType, ContextType, RequireFields<ReviewsReviewArgs, 'url'>>;
  search?: Resolver<Array<ResolversTypes['ReviewsSearchResult']>, ParentType, ContextType, RequireFields<ReviewsSearchArgs, 'query'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReviewsSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReviewsSearchResult'] = ResolversParentTypes['ReviewsSearchResult']> = {
  score?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Steam'] = ResolversParentTypes['Steam']> = {
  chart?: Resolver<Array<ResolversTypes['SteamChartEntry']>, ParentType, ContextType, RequireFields<SteamChartArgs, 'chart'>>;
  playerCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<SteamPlayerCountArgs, 'appId'>>;
  profile?: Resolver<ResolversTypes['SteamProfile'], ParentType, ContextType, RequireFields<SteamProfileArgs, 'steamId64'>>;
  recentlyPlayed?: Resolver<Array<ResolversTypes['SteamRecentlyPlayedEntry']>, ParentType, ContextType, RequireFields<SteamRecentlyPlayedArgs, 'steamId64'>>;
  search?: Resolver<Array<ResolversTypes['SteamSearchResult']>, ParentType, ContextType, RequireFields<SteamSearchArgs, 'query'>>;
  steamId64?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<SteamSteamId64Args, 'vanityUrl'>>;
  store?: Resolver<Array<ResolversTypes['SteamApp']>, ParentType, ContextType, RequireFields<SteamStoreArgs, 'appIds'>>;
  upcomingSales?: Resolver<ResolversTypes['SteamSales'], ParentType, ContextType>;
  wishlist?: Resolver<Array<ResolversTypes['SteamWishlistEntry']>, ParentType, ContextType, RequireFields<SteamWishlistArgs, 'steamId64'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamApp'] = ResolversParentTypes['SteamApp']> = {
  assets?: Resolver<Maybe<ResolversTypes['SteamAppAssets']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  developers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  discounted?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  franchises?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isFree?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isGiftable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isReleased?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  publishers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  regular?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  release?: Resolver<ResolversTypes['SteamAppRelease'], ParentType, ContextType>;
  screenshots?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trailers?: Resolver<Array<ResolversTypes['SteamAppTrailers']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppAssetsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamAppAssets'] = ResolversParentTypes['SteamAppAssets']> = {
  background?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  capsule?: Resolver<ResolversTypes['SteamAppCapsuleAssets'], ParentType, ContextType>;
  communityIcon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  header?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  library?: Resolver<ResolversTypes['SteamAppLibraryAssets'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppCapsuleAssetsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamAppCapsuleAssets'] = ResolversParentTypes['SteamAppCapsuleAssets']> = {
  hero?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  main?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  small?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppLibraryAssetsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamAppLibraryAssets'] = ResolversParentTypes['SteamAppLibraryAssets']> = {
  capsule?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  capsule2x?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hero?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hero2x?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppReleaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamAppRelease'] = ResolversParentTypes['SteamAppRelease']> = {
  customMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppTrailerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamAppTrailer'] = ResolversParentTypes['SteamAppTrailer']> = {
  max?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  sd?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamAppTrailersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamAppTrailers'] = ResolversParentTypes['SteamAppTrailers']> = {
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trailer?: Resolver<ResolversTypes['SteamAppTrailer'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamChartEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamChartEntry'] = ResolversParentTypes['SteamChartEntry']> = {
  count?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamProfileResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamProfile'] = ResolversParentTypes['SteamProfile']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  logoutAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamRecentlyPlayedEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamRecentlyPlayedEntry'] = ResolversParentTypes['SteamRecentlyPlayedEntry']> = {
  biweeklyHours?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalHours?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamSalesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamSales'] = ResolversParentTypes['SteamSales']> = {
  sale?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  upcoming?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamSearchResult'] = ResolversParentTypes['SteamSearchResult']> = {
  appId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SteamWishlistEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SteamWishlistEntry'] = ResolversParentTypes['SteamWishlistEntry']> = {
  assets?: Resolver<Maybe<ResolversTypes['SteamAppAssets']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  developers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  discount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  discounted?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  franchises?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isFree?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isGiftable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isReleased?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  publishers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  regular?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  release?: Resolver<ResolversTypes['SteamAppRelease'], ParentType, ContextType>;
  screenshots?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trailers?: Resolver<Array<ResolversTypes['SteamAppTrailers']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TmdbResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Tmdb'] = ResolversParentTypes['Tmdb']> = {
  movie?: Resolver<ResolversTypes['TmdbMovie'], ParentType, ContextType, RequireFields<TmdbMovieArgs, 'input'>>;
  search?: Resolver<Array<ResolversTypes['TmdbSearchResult']>, ParentType, ContextType, RequireFields<TmdbSearchArgs, 'query'>>;
  series?: Resolver<ResolversTypes['TmdbSeries'], ParentType, ContextType, RequireFields<TmdbSeriesArgs, 'input'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbMovieResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbMovie'] = ResolversParentTypes['TmdbMovie']> = {
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overview?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  providers?: Resolver<ResolversTypes['TmdbProviders'], ParentType, ContextType>;
  releaseDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tagline?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbProvidersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbProviders'] = ResolversParentTypes['TmdbProviders']> = {
  buy?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  rent?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  stream?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbSearchResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbSearchResult'] = ResolversParentTypes['TmdbSearchResult']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbSeriesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbSeries'] = ResolversParentTypes['TmdbSeries']> = {
  episodes?: Resolver<ResolversTypes['TmdbSeriesEpisodes'], ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overview?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  providers?: Resolver<ResolversTypes['TmdbProviders'], ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seasons?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tagline?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbSeriesEpisodesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbSeriesEpisodes'] = ResolversParentTypes['TmdbSeriesEpisodes']> = {
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last?: Resolver<ResolversTypes['TmdbSeriesLastEpisode'], ParentType, ContextType>;
  next?: Resolver<ResolversTypes['TmdbSeriesNextEpisode'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbSeriesLastEpisodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbSeriesLastEpisode'] = ResolversParentTypes['TmdbSeriesLastEpisode']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TmdbSeriesNextEpisodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TmdbSeriesNextEpisode'] = ResolversParentTypes['TmdbSeriesNextEpisode']> = {
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AniList?: AniListResolvers<ContextType>;
  AniListAiringSchedule?: AniListAiringScheduleResolvers<ContextType>;
  AniListCharacter?: AniListCharacterResolvers<ContextType>;
  AniListCharacterMediaConnection?: AniListCharacterMediaConnectionResolvers<ContextType>;
  AniListCharacterPage?: AniListCharacterPageResolvers<ContextType>;
  AniListCharacterWithConnections?: AniListCharacterWithConnectionsResolvers<ContextType>;
  AniListCharactersPage?: AniListCharactersPageResolvers<ContextType>;
  AniListCharactersSearchResult?: AniListCharactersSearchResultResolvers<ContextType>;
  AniListCoverImage?: AniListCoverImageResolvers<ContextType>;
  AniListEpisode?: AniListEpisodeResolvers<ContextType>;
  AniListFuzzyDate?: AniListFuzzyDateResolvers<ContextType>;
  AniListMedia?: AniListMediaResolvers<ContextType>;
  AniListMediaCharactersConnection?: AniListMediaCharactersConnectionResolvers<ContextType>;
  AniListMediaPage?: AniListMediaPageResolvers<ContextType>;
  AniListMediaRecommendationsConnection?: AniListMediaRecommendationsConnectionResolvers<ContextType>;
  AniListMediaRecommendationsPage?: AniListMediaRecommendationsPageResolvers<ContextType>;
  AniListMediaRelationsConnection?: AniListMediaRelationsConnectionResolvers<ContextType>;
  AniListMediaSearchResult?: AniListMediaSearchResultResolvers<ContextType>;
  AniListMediaStaffConnection?: AniListMediaStaffConnectionResolvers<ContextType>;
  AniListMediaStudiosConnection?: AniListMediaStudiosConnectionResolvers<ContextType>;
  AniListMediaWithConnections?: AniListMediaWithConnectionsResolvers<ContextType>;
  AniListMultiSearchResult?: AniListMultiSearchResultResolvers<ContextType>;
  AniListPageInfo?: AniListPageInfoResolvers<ContextType>;
  AniListRanking?: AniListRankingResolvers<ContextType>;
  AniListStaff?: AniListStaffResolvers<ContextType>;
  AniListStaffCharactersConnection?: AniListStaffCharactersConnectionResolvers<ContextType>;
  AniListStaffMembersPage?: AniListStaffMembersPageResolvers<ContextType>;
  AniListStaffProductionConnection?: AniListStaffProductionConnectionResolvers<ContextType>;
  AniListStaffProductionPage?: AniListStaffProductionPageResolvers<ContextType>;
  AniListStaffSearchResult?: AniListStaffSearchResultResolvers<ContextType>;
  AniListStaffVoiceActingConnection?: AniListStaffVoiceActingConnectionResolvers<ContextType>;
  AniListStaffVoiceActingPage?: AniListStaffVoiceActingPageResolvers<ContextType>;
  AniListStaffWithConnections?: AniListStaffWithConnectionsResolvers<ContextType>;
  AniListStream?: AniListStreamResolvers<ContextType>;
  AniListStudio?: AniListStudioResolvers<ContextType>;
  AniListStudioMediaConnection?: AniListStudioMediaConnectionResolvers<ContextType>;
  AniListStudioPage?: AniListStudioPageResolvers<ContextType>;
  AniListStudioWithConnections?: AniListStudioWithConnectionsResolvers<ContextType>;
  AniListStudiosSearchResult?: AniListStudiosSearchResultResolvers<ContextType>;
  AniListTag?: AniListTagResolvers<ContextType>;
  AniListTitle?: AniListTitleResolvers<ContextType>;
  AniListTracker?: AniListTrackerResolvers<ContextType>;
  AniListTrailer?: AniListTrailerResolvers<ContextType>;
  AnimeSchedule?: AnimeScheduleResolvers<ContextType>;
  AnimeScheduleAiringEpisode?: AnimeScheduleAiringEpisodeResolvers<ContextType>;
  AnimeScheduleAiringEpisodeDelay?: AnimeScheduleAiringEpisodeDelayResolvers<ContextType>;
  AnimeScheduleAiringSchedule?: AnimeScheduleAiringScheduleResolvers<ContextType>;
  AnimeScheduleTitle?: AnimeScheduleTitleResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Hltb?: HltbResolvers<ContextType>;
  HltbPlaytimes?: HltbPlaytimesResolvers<ContextType>;
  HltbSearchResult?: HltbSearchResultResolvers<ContextType>;
  Igdb?: IgdbResolvers<ContextType>;
  IgdbGamingEvent?: IgdbGamingEventResolvers<ContextType>;
  IgdbGamingEventUrl?: IgdbGamingEventUrlResolvers<ContextType>;
  IgdbSearchResult?: IgdbSearchResultResolvers<ContextType>;
  Itad?: ItadResolvers<ContextType>;
  ItadBundle?: ItadBundleResolvers<ContextType>;
  ItadBundleTier?: ItadBundleTierResolvers<ContextType>;
  ItadBundleTierGame?: ItadBundleTierGameResolvers<ContextType>;
  ItadDeal?: ItadDealResolvers<ContextType>;
  ItadFreebie?: ItadFreebieResolvers<ContextType>;
  ItadHistoricalLow?: ItadHistoricalLowResolvers<ContextType>;
  ItadOverview?: ItadOverviewResolvers<ContextType>;
  ItadPlayerCount?: ItadPlayerCountResolvers<ContextType>;
  ItadPrice?: ItadPriceResolvers<ContextType>;
  ItadReviews?: ItadReviewsResolvers<ContextType>;
  ItadSearchResult?: ItadSearchResultResolvers<ContextType>;
  Mangadex?: MangadexResolvers<ContextType>;
  MangadexChapter?: MangadexChapterResolvers<ContextType>;
  MangadexManga?: MangadexMangaResolvers<ContextType>;
  MangadexMangaChapter?: MangadexMangaChapterResolvers<ContextType>;
  MangadexSearchResult?: MangadexSearchResultResolvers<ContextType>;
  MangadexTrackers?: MangadexTrackersResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reddit?: RedditResolvers<ContextType>;
  RedditGalleryEntry?: RedditGalleryEntryResolvers<ContextType>;
  RedditPost?: RedditPostResolvers<ContextType>;
  Review?: ReviewResolvers<ContextType>;
  ReviewAggregateRating?: ReviewAggregateRatingResolvers<ContextType>;
  ReviewTrailer?: ReviewTrailerResolvers<ContextType>;
  Reviews?: ReviewsResolvers<ContextType>;
  ReviewsSearchResult?: ReviewsSearchResultResolvers<ContextType>;
  Steam?: SteamResolvers<ContextType>;
  SteamApp?: SteamAppResolvers<ContextType>;
  SteamAppAssets?: SteamAppAssetsResolvers<ContextType>;
  SteamAppCapsuleAssets?: SteamAppCapsuleAssetsResolvers<ContextType>;
  SteamAppLibraryAssets?: SteamAppLibraryAssetsResolvers<ContextType>;
  SteamAppRelease?: SteamAppReleaseResolvers<ContextType>;
  SteamAppTrailer?: SteamAppTrailerResolvers<ContextType>;
  SteamAppTrailers?: SteamAppTrailersResolvers<ContextType>;
  SteamChartEntry?: SteamChartEntryResolvers<ContextType>;
  SteamProfile?: SteamProfileResolvers<ContextType>;
  SteamRecentlyPlayedEntry?: SteamRecentlyPlayedEntryResolvers<ContextType>;
  SteamSales?: SteamSalesResolvers<ContextType>;
  SteamSearchResult?: SteamSearchResultResolvers<ContextType>;
  SteamWishlistEntry?: SteamWishlistEntryResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  Tmdb?: TmdbResolvers<ContextType>;
  TmdbMovie?: TmdbMovieResolvers<ContextType>;
  TmdbProviders?: TmdbProvidersResolvers<ContextType>;
  TmdbSearchResult?: TmdbSearchResultResolvers<ContextType>;
  TmdbSeries?: TmdbSeriesResolvers<ContextType>;
  TmdbSeriesEpisodes?: TmdbSeriesEpisodesResolvers<ContextType>;
  TmdbSeriesLastEpisode?: TmdbSeriesLastEpisodeResolvers<ContextType>;
  TmdbSeriesNextEpisode?: TmdbSeriesNextEpisodeResolvers<ContextType>;
};


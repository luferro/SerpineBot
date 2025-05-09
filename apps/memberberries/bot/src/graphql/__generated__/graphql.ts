/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Banking account number is a string of 5 to 17 alphanumeric values for representing an generic account number */
  AccountNumber: { input: any; output: any; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: any; output: any; }
  /** The `Byte` scalar type represents byte value as a Buffer */
  Byte: { input: any; output: any; }
  /** A country code as defined by ISO 3166-1 alpha-2 */
  CountryCode: { input: any; output: any; }
  /** A country name (short name) as defined by ISO 3166-1 */
  CountryName: { input: any; output: any; }
  /** A field whose value conforms to the standard cuid format as specified in https://github.com/ericelliott/cuid#broken-down */
  Cuid: { input: any; output: any; }
  /** A field whose value is a Currency: https://en.wikipedia.org/wiki/ISO_4217. */
  Currency: { input: any; output: any; }
  /** A field whose value conforms to the standard DID format as specified in did-core: https://www.w3.org/TR/did-core/. */
  DID: { input: any; output: any; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any; }
  /** A field whose value conforms to the standard DeweyDecimal format as specified by the OCLC https://www.oclc.org/content/dam/oclc/dewey/resources/summaries/deweysummaries.pdf */
  DeweyDecimal: { input: any; output: any; }
  /**
   *
   *     A string representing a duration conforming to the ISO8601 standard,
   *     such as: P1W1DT13H23M34S
   *     P is the duration designator (for period) placed at the start of the duration representation.
   *     Y is the year designator that follows the value for the number of years.
   *     M is the month designator that follows the value for the number of months.
   *     W is the week designator that follows the value for the number of weeks.
   *     D is the day designator that follows the value for the number of days.
   *     T is the time designator that precedes the time components of the representation.
   *     H is the hour designator that follows the value for the number of hours.
   *     M is the minute designator that follows the value for the number of minutes.
   *     S is the second designator that follows the value for the number of seconds.
   *
   *     Note the time designator, T, that precedes the time value.
   *
   *     Matches moment.js, Luxon and DateFns implementations
   *     ,/. is valid for decimal places and +/- is a valid prefix
   *
   */
  Duration: { input: any; output: any; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: any; output: any; }
  /** A field whose value is a generic Universally Unique Identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier. */
  GUID: { input: any; output: any; }
  /** A GeoJSON object as defined by RFC 7946: https://datatracker.ietf.org/doc/html/rfc7946 */
  GeoJSON: { input: any; output: any; }
  /** A field whose value is a CSS HSL color: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#hsl()_and_hsla(). */
  HSL: { input: any; output: any; }
  /** A field whose value is a CSS HSLA color: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#hsl()_and_hsla(). */
  HSLA: { input: any; output: any; }
  /** A field whose value is a hex color code: https://en.wikipedia.org/wiki/Web_colors. */
  HexColorCode: { input: any; output: any; }
  /** A field whose value is a hexadecimal: https://en.wikipedia.org/wiki/Hexadecimal. */
  Hexadecimal: { input: any; output: any; }
  /** A field whose value is an International Bank Account Number (IBAN): https://en.wikipedia.org/wiki/International_Bank_Account_Number. */
  IBAN: { input: any; output: any; }
  /** A field whose value is either an IPv4 or IPv6 address: https://en.wikipedia.org/wiki/IP_address. */
  IP: { input: any; output: any; }
  /** A field whose value is an IPC Class Symbol within the International Patent Classification System: https://www.wipo.int/classifications/ipc/en/ */
  IPCPatent: { input: any; output: any; }
  /** A field whose value is a IPv4 address: https://en.wikipedia.org/wiki/IPv4. */
  IPv4: { input: any; output: any; }
  /** A field whose value is a IPv6 address: https://en.wikipedia.org/wiki/IPv6. */
  IPv6: { input: any; output: any; }
  /** A field whose value is a ISBN-10 or ISBN-13 number: https://en.wikipedia.org/wiki/International_Standard_Book_Number. */
  ISBN: { input: any; output: any; }
  /**
   *
   *     A string representing a duration conforming to the ISO8601 standard,
   *     such as: P1W1DT13H23M34S
   *     P is the duration designator (for period) placed at the start of the duration representation.
   *     Y is the year designator that follows the value for the number of years.
   *     M is the month designator that follows the value for the number of months.
   *     W is the week designator that follows the value for the number of weeks.
   *     D is the day designator that follows the value for the number of days.
   *     T is the time designator that precedes the time components of the representation.
   *     H is the hour designator that follows the value for the number of hours.
   *     M is the minute designator that follows the value for the number of minutes.
   *     S is the second designator that follows the value for the number of seconds.
   *
   *     Note the time designator, T, that precedes the time value.
   *
   *     Matches moment.js, Luxon and DateFns implementations
   *     ,/. is valid for decimal places and +/- is a valid prefix
   *
   */
  ISO8601Duration: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** A field whose value is a JSON Web Token (JWT): https://jwt.io/introduction. */
  JWT: { input: any; output: any; }
  /** A field whose value conforms to the Library of Congress Subclass Format ttps://www.loc.gov/catdir/cpso/lcco/ */
  LCCSubclass: { input: any; output: any; }
  /** A field whose value is a valid decimal degrees latitude number (53.471): https://en.wikipedia.org/wiki/Latitude */
  Latitude: { input: any; output: any; }
  /** A local date string (i.e., with no associated timezone) in `YYYY-MM-DD` format, e.g. `2020-01-01`. */
  LocalDate: { input: any; output: any; }
  /** A local date-time string (i.e., with no associated timezone) in `YYYY-MM-DDTHH:mm:ss` format, e.g. `2020-01-01T00:00:00`. */
  LocalDateTime: { input: any; output: any; }
  /** A local time string (i.e., with no associated timezone) in 24-hr `HH:mm[:ss[.SSS]]` format, e.g. `14:25` or `14:25:06` or `14:25:06.123`.  This scalar is very similar to the `LocalTime`, with the only difference being that `LocalEndTime` also allows `24:00` as a valid value to indicate midnight of the following day.  This is useful when using the scalar to represent the exclusive upper bound of a time block. */
  LocalEndTime: { input: any; output: any; }
  /** A local time string (i.e., with no associated timezone) in 24-hr `HH:mm[:ss[.SSS]]` format, e.g. `14:25` or `14:25:06` or `14:25:06.123`. */
  LocalTime: { input: any; output: any; }
  /** The locale in the format of a BCP 47 (RFC 5646) standard string */
  Locale: { input: any; output: any; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  Long: { input: any; output: any; }
  /** A field whose value is a valid decimal degrees longitude number (53.471): https://en.wikipedia.org/wiki/Longitude */
  Longitude: { input: any; output: any; }
  /** A field whose value is a IEEE 802 48-bit MAC address: https://en.wikipedia.org/wiki/MAC_address. */
  MAC: { input: any; output: any; }
  /** Floats that will have a value less than 0. */
  NegativeFloat: { input: any; output: any; }
  /** Integers that will have a value less than 0. */
  NegativeInt: { input: any; output: any; }
  /** A string that cannot be passed as an empty value */
  NonEmptyString: { input: any; output: any; }
  /** Floats that will have a value of 0 or more. */
  NonNegativeFloat: { input: any; output: any; }
  /** Integers that will have a value of 0 or more. */
  NonNegativeInt: { input: any; output: any; }
  /** Floats that will have a value of 0 or less. */
  NonPositiveFloat: { input: any; output: any; }
  /** Integers that will have a value of 0 or less. */
  NonPositiveInt: { input: any; output: any; }
  /** A field whose value conforms with the standard mongodb object ID as described here: https://docs.mongodb.com/manual/reference/method/ObjectId/#ObjectId. Example: 5e5677d71bdc2ae76344968c */
  ObjectID: { input: any; output: any; }
  /** A field whose value conforms to the standard E.164 format as specified in: https://en.wikipedia.org/wiki/E.164. Basically this is +17895551234. */
  PhoneNumber: { input: any; output: any; }
  /** A field whose value is a valid TCP port within the range of 0 to 65535: https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_ports */
  Port: { input: any; output: any; }
  /** Floats that will have a value greater than 0. */
  PositiveFloat: { input: any; output: any; }
  /** Integers that will have a value greater than 0. */
  PositiveInt: { input: any; output: any; }
  /** A field whose value conforms to the standard postal code formats for United States, United Kingdom, Germany, Canada, France, Italy, Australia, Netherlands, Spain, Denmark, Sweden, Belgium, India, Austria, Portugal, Switzerland or Luxembourg. */
  PostalCode: { input: any; output: any; }
  /** A field whose value is a CSS RGB color: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb()_and_rgba(). */
  RGB: { input: any; output: any; }
  /** A field whose value is a CSS RGBA color: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb()_and_rgba(). */
  RGBA: { input: any; output: any; }
  /** In the US, an ABA routing transit number (`ABA RTN`) is a nine-digit code to identify the financial institution. */
  RoutingNumber: { input: any; output: any; }
  /** A field whose value conforms to the standard personal number (personnummer) formats for Sweden */
  SESSN: { input: any; output: any; }
  /** The `SafeInt` scalar type represents non-fractional signed whole numeric values that are considered safe as defined by the ECMAScript specification. */
  SafeInt: { input: any; output: any; }
  /** A field whose value is a Semantic Version: https://semver.org */
  SemVer: { input: any; output: any; }
  /** A time string at UTC, such as 10:15:30Z, compliant with the `full-time` format outlined in section 5.6 of the RFC 3339profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Time: { input: any; output: any; }
  /** A field whose value exists in the standard IANA Time Zone Database: https://www.iana.org/time-zones */
  TimeZone: { input: any; output: any; }
  /** The javascript `Date` as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: { input: any; output: any; }
  /** A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt. */
  URL: { input: any; output: any; }
  /** A currency string, such as $21.25 */
  USCurrency: { input: any; output: any; }
  /** A field whose value is a generic Universally Unique Identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier. */
  UUID: { input: any; output: any; }
  /** Floats that will have a value of 0 or more. */
  UnsignedFloat: { input: any; output: any; }
  /** Integers that will have a value of 0 or more. */
  UnsignedInt: { input: any; output: any; }
  /** A field whose value is a UTC Offset: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones */
  UtcOffset: { input: any; output: any; }
  /** Represents NULL values */
  Void: { input: any; output: any; }
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
  reviews?: Maybe<ItadReviews>;
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
  discounted: Scalars['String']['output'];
  franchises: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isFree: Scalars['Boolean']['output'];
  isGiftable: Scalars['Boolean']['output'];
  isReleased: Scalars['Boolean']['output'];
  publishers: Array<Scalars['String']['output']>;
  regular: Scalars['String']['output'];
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
  date: Scalars['Int']['output'];
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
  biweeklyHours: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalHours: Scalars['Int']['output'];
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
  discounted: Scalars['String']['output'];
  franchises: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isFree: Scalars['Boolean']['output'];
  isGiftable: Scalars['Boolean']['output'];
  isReleased: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  publishers: Array<Scalars['String']['output']>;
  regular: Scalars['String']['output'];
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

export type SearchHltbQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchHltbQuery = { __typename?: 'Query', hltb: { __typename?: 'Hltb', search: Array<{ __typename?: 'HltbSearchResult', id: string, title: string, releaseYear: number }> } };

export type GetHltbPlaytimesQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetHltbPlaytimesQuery = { __typename?: 'Query', hltb: { __typename?: 'Hltb', playtimes: { __typename?: 'HltbPlaytimes', id: string, title: string, url: string, image?: string | null, main?: string | null, mainExtra?: string | null, completionist?: string | null } } };

export type GetIgdbUpcomingEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIgdbUpcomingEventsQuery = { __typename?: 'Query', igdb: { __typename?: 'Igdb', upcomingEvents: Array<{ __typename?: 'IgdbGamingEvent', name: string, image?: string | null, description?: string | null, scheduledStartAt: any, scheduledEndAt: any, url: { __typename?: 'IgdbGamingEventUrl', youtube?: string | null, twitch?: string | null } }> } };

export type SearchItadQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchItadQuery = { __typename?: 'Query', itad: { __typename?: 'Itad', search: Array<{ __typename?: 'ItadSearchResult', id: string, title: string }> } };

export type GetItadDealQueryVariables = Exact<{
  input: ItadDealInput;
}>;


export type GetItadDealQuery = { __typename?: 'Query', itad: { __typename?: 'Itad', deal: { __typename?: 'ItadOverview', id: string, appId: number, slug: string, title: string, image?: string | null, releaseDate?: string | null, isEarlyAccess: boolean, hasAchievements: boolean, hasTradingCards: boolean, reviews?: { __typename?: 'ItadReviews', score: number, source: string, count: number, url: string } | null, playerCount?: { __typename?: 'ItadPlayerCount', recent: number, day: number, week: number, peak: number } | null, historicalLow: { __typename?: 'ItadHistoricalLow', all?: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string } | null, y1?: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string } | null, m3?: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string } | null }, deals: Array<{ __typename?: 'ItadDeal', url: string, voucher?: string | null, store: string, discount: number, drm: Array<string>, platforms: Array<string>, timestamp: any, expiry?: any | null, regular: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string }, discounted: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string }, storeHistoricalLow?: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string } | null }>, bundles: Array<{ __typename?: 'ItadBundle', id: number, title: string, url: string, store: string, timestamp: any, expiry?: any | null, tiers: Array<{ __typename?: 'ItadBundleTier', price?: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string } | null, games: Array<{ __typename?: 'ItadBundleTierGame', id: string, slug: string, title: string, type?: string | null, mature: boolean }> }> }> } } };

export type GetItadFreebiesQueryVariables = Exact<{
  country?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetItadFreebiesQuery = { __typename?: 'Query', itad: { __typename?: 'Itad', freebies: Array<{ __typename?: 'ItadFreebie', id: string, slug: string, title: string, type?: string | null, url: string, voucher?: string | null, store: string, discount: number, drm: Array<string>, platforms: Array<string>, timestamp: any, expiry?: any | null, regular: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string }, discounted: { __typename?: 'ItadPrice', amount: number, amountInt: number, currency: string } }> } };

export type GetRedditPostsQueryVariables = Exact<{
  input: RedditPostsInput;
}>;


export type GetRedditPostsQuery = { __typename?: 'Query', reddit: { __typename?: 'Reddit', posts: Array<{ __typename?: 'RedditPost', title: string, url: string, selfurl: string, selftext?: string | null, isSelf: boolean, isCrosspost: boolean, isNsfw: boolean, isGallery: boolean, isImage: boolean, isVideo: boolean, isYoutubeEmbed: boolean, publishedAt?: any | null, gallery: Array<{ __typename?: 'RedditGalleryEntry', url: string }> }> } };

export type SearchReviewQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchReviewQuery = { __typename?: 'Query', reviews: { __typename?: 'Reviews', search: Array<{ __typename?: 'ReviewsSearchResult', title: string, url: string, score: number }> } };

export type GetReviewQueryVariables = Exact<{
  url: Scalars['String']['input'];
}>;


export type GetReviewQuery = { __typename?: 'Query', reviews: { __typename?: 'Reviews', review: { __typename?: 'Review', title: string, url: string, image: string, description: string, releaseDate: any, genres: Array<string>, platforms: Array<string>, developers: Array<string>, publishers: Array<string>, trailer?: { __typename?: 'ReviewTrailer', title: string, description: string, thumbnailUrl: string } | null, aggregateRating: { __typename?: 'ReviewAggregateRating', tier: string, ratingValue: number, reviewCount: number } } } };

export type SearchSteamAppsQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchSteamAppsQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', search: Array<{ __typename?: 'SteamSearchResult', appId: number, title: string, url: string, image: string, price: string }> } };

export type GetSteamId64QueryVariables = Exact<{
  vanityUrl: Scalars['String']['input'];
}>;


export type GetSteamId64Query = { __typename?: 'Query', steam: { __typename?: 'Steam', steamId64?: string | null } };

export type GetSteamProfileQueryVariables = Exact<{
  steamId64: Scalars['String']['input'];
}>;


export type GetSteamProfileQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', profile: { __typename?: 'SteamProfile', id: string, name: string, image: string, status: string, logoutAt: any, createdAt: any } } };

export type GetSteamRecentlyPlayedQueryVariables = Exact<{
  steamId64: Scalars['String']['input'];
}>;


export type GetSteamRecentlyPlayedQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', recentlyPlayed: Array<{ __typename?: 'SteamRecentlyPlayedEntry', id: string, title: string, url: string, totalHours: number, biweeklyHours: number }> } };

export type GetSteamWishlistQueryVariables = Exact<{
  steamId64: Scalars['String']['input'];
}>;


export type GetSteamWishlistQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', wishlist: Array<{ __typename?: 'SteamWishlistEntry', priority: number, id: number, title: string, url: string, discount: number, regular: string, discounted: string, isFree: boolean, isReleased: boolean, release: { __typename?: 'SteamAppRelease', date: number, customMessage?: string | null }, assets?: { __typename?: 'SteamAppAssets', capsule: { __typename?: 'SteamAppCapsuleAssets', hero: string } } | null }> } };

export type GetSteamAppPlayerCountQueryVariables = Exact<{
  appId: Scalars['Int']['input'];
}>;


export type GetSteamAppPlayerCountQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', playerCount: number } };

export type GetSteamAppsQueryVariables = Exact<{
  appIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type GetSteamAppsQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', store: Array<{ __typename?: 'SteamApp', id: number, title: string, url: string, description: string, discount: number, regular: string, discounted: string, isFree: boolean, isReleased: boolean, isGiftable: boolean, developers: Array<string>, publishers: Array<string>, franchises: Array<string>, screenshots: Array<string>, release: { __typename?: 'SteamAppRelease', date: number, customMessage?: string | null }, trailers: Array<{ __typename?: 'SteamAppTrailers', title: string, trailer: { __typename?: 'SteamAppTrailer', sd: Array<string>, max: Array<string> } }>, assets?: { __typename?: 'SteamAppAssets', capsule: { __typename?: 'SteamAppCapsuleAssets', hero: string } } | null }> } };

export type GetSteamUpcomingSalesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSteamUpcomingSalesQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', upcomingSales: { __typename?: 'SteamSales', sale?: string | null, status: string, upcoming: Array<string> } } };

export type GetSteamChartQueryVariables = Exact<{
  chart: SteamChartType;
}>;


export type GetSteamChartQuery = { __typename?: 'Query', steam: { __typename?: 'Steam', chart: Array<{ __typename?: 'SteamChartEntry', position: number, name: string, url: string, count?: string | null }> } };


export const SearchHltbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchHltb"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hltb"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"releaseYear"}}]}}]}}]}}]} as unknown as DocumentNode<SearchHltbQuery, SearchHltbQueryVariables>;
export const GetHltbPlaytimesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetHltbPlaytimes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hltb"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playtimes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"main"}},{"kind":"Field","name":{"kind":"Name","value":"mainExtra"}},{"kind":"Field","name":{"kind":"Name","value":"completionist"}}]}}]}}]}}]} as unknown as DocumentNode<GetHltbPlaytimesQuery, GetHltbPlaytimesQueryVariables>;
export const GetIgdbUpcomingEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIgdbUpcomingEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"igdb"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upcomingEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"youtube"}},{"kind":"Field","name":{"kind":"Name","value":"twitch"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetIgdbUpcomingEventsQuery, GetIgdbUpcomingEventsQueryVariables>;
export const SearchItadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchItad"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itad"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<SearchItadQuery, SearchItadQueryVariables>;
export const GetItadDealDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetItadDeal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ItadDealInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itad"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"releaseDate"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"playerCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recent"}},{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"week"}},{"kind":"Field","name":{"kind":"Name","value":"peak"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isEarlyAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasAchievements"}},{"kind":"Field","name":{"kind":"Name","value":"hasTradingCards"}},{"kind":"Field","name":{"kind":"Name","value":"historicalLow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"y1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"m3"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"deals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"voucher"}},{"kind":"Field","name":{"kind":"Name","value":"store"}},{"kind":"Field","name":{"kind":"Name","value":"regular"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeHistoricalLow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"drm"}},{"kind":"Field","name":{"kind":"Name","value":"platforms"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"expiry"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bundles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"store"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"mature"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"expiry"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetItadDealQuery, GetItadDealQueryVariables>;
export const GetItadFreebiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetItadFreebies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"country"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itad"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"freebies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"country"},"value":{"kind":"Variable","name":{"kind":"Name","value":"country"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"voucher"}},{"kind":"Field","name":{"kind":"Name","value":"store"}},{"kind":"Field","name":{"kind":"Name","value":"regular"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountInt"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"drm"}},{"kind":"Field","name":{"kind":"Name","value":"platforms"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"expiry"}}]}}]}}]}}]} as unknown as DocumentNode<GetItadFreebiesQuery, GetItadFreebiesQueryVariables>;
export const GetRedditPostsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRedditPosts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RedditPostsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reddit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"posts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"selfurl"}},{"kind":"Field","name":{"kind":"Name","value":"selftext"}},{"kind":"Field","name":{"kind":"Name","value":"gallery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"isCrosspost"}},{"kind":"Field","name":{"kind":"Name","value":"isNsfw"}},{"kind":"Field","name":{"kind":"Name","value":"isGallery"}},{"kind":"Field","name":{"kind":"Name","value":"isImage"}},{"kind":"Field","name":{"kind":"Name","value":"isVideo"}},{"kind":"Field","name":{"kind":"Name","value":"isYoutubeEmbed"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetRedditPostsQuery, GetRedditPostsQueryVariables>;
export const SearchReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}}]}}]}}]} as unknown as DocumentNode<SearchReviewQuery, SearchReviewQueryVariables>;
export const GetReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"review"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"releaseDate"}},{"kind":"Field","name":{"kind":"Name","value":"genres"}},{"kind":"Field","name":{"kind":"Name","value":"platforms"}},{"kind":"Field","name":{"kind":"Name","value":"trailer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"aggregateRating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"ratingValue"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"developers"}},{"kind":"Field","name":{"kind":"Name","value":"publishers"}}]}}]}}]}}]} as unknown as DocumentNode<GetReviewQuery, GetReviewQueryVariables>;
export const SearchSteamAppsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchSteamApps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}}]}}]} as unknown as DocumentNode<SearchSteamAppsQuery, SearchSteamAppsQueryVariables>;
export const GetSteamId64Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamId64"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vanityUrl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steamId64"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"vanityUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vanityUrl"}}}]}]}}]}}]} as unknown as DocumentNode<GetSteamId64Query, GetSteamId64QueryVariables>;
export const GetSteamProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"steamId64"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"steamId64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"steamId64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"logoutAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetSteamProfileQuery, GetSteamProfileQueryVariables>;
export const GetSteamRecentlyPlayedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamRecentlyPlayed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"steamId64"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentlyPlayed"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"steamId64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"steamId64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"totalHours"}},{"kind":"Field","name":{"kind":"Name","value":"biweeklyHours"}}]}}]}}]}}]} as unknown as DocumentNode<GetSteamRecentlyPlayedQuery, GetSteamRecentlyPlayedQueryVariables>;
export const GetSteamWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"steamId64"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"steamId64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"steamId64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"release"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"customMessage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"regular"}},{"kind":"Field","name":{"kind":"Name","value":"discounted"}},{"kind":"Field","name":{"kind":"Name","value":"isFree"}},{"kind":"Field","name":{"kind":"Name","value":"isReleased"}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capsule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hero"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSteamWishlistQuery, GetSteamWishlistQueryVariables>;
export const GetSteamAppPlayerCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamAppPlayerCount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"appId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"playerCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"appId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"appId"}}}]}]}}]}}]} as unknown as DocumentNode<GetSteamAppPlayerCountQuery, GetSteamAppPlayerCountQueryVariables>;
export const GetSteamAppsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamApps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"appIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"store"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"appIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"appIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"release"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"customMessage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"regular"}},{"kind":"Field","name":{"kind":"Name","value":"discounted"}},{"kind":"Field","name":{"kind":"Name","value":"isFree"}},{"kind":"Field","name":{"kind":"Name","value":"isReleased"}},{"kind":"Field","name":{"kind":"Name","value":"isGiftable"}},{"kind":"Field","name":{"kind":"Name","value":"developers"}},{"kind":"Field","name":{"kind":"Name","value":"publishers"}},{"kind":"Field","name":{"kind":"Name","value":"franchises"}},{"kind":"Field","name":{"kind":"Name","value":"screenshots"}},{"kind":"Field","name":{"kind":"Name","value":"trailers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"trailer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sd"}},{"kind":"Field","name":{"kind":"Name","value":"max"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capsule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hero"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSteamAppsQuery, GetSteamAppsQueryVariables>;
export const GetSteamUpcomingSalesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamUpcomingSales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upcomingSales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sale"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"upcoming"}}]}}]}}]}}]} as unknown as DocumentNode<GetSteamUpcomingSalesQuery, GetSteamUpcomingSalesQueryVariables>;
export const GetSteamChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSteamChart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chart"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SteamChartType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chart"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chart"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<GetSteamChartQuery, GetSteamChartQueryVariables>;
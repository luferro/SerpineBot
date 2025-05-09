import { gql } from "graphql-tag";
import { CHARACTER_CONNECTION_FIELDS } from "../fragments/character.fragment.js";
import { MEDIA_CONNECTIONS, MEDIA_FIELDS, RECOMMENDATION_CONNECTION_FIELDS } from "../fragments/media.fragment.js";
import { STAFF_CONNECTION_FIELDS } from "../fragments/staff.fragment.js";
import { STUDIO_CONNECTION_FIELDS } from "../fragments/studio.fragment.js";

export const GET_MEDIA = gql`
  query getMedia($id: Int!, $type: MediaType!) {
    Media(id: $id, type: $type) {
      ...MediaFields
      ...MediaConnections
    }
  }
  ${MEDIA_FIELDS}
  ${MEDIA_CONNECTIONS}
`;

export const GET_RECOMMENDATIONS = gql`
  query getRecommendations($id: Int!, $page: Int) {
    Media(id: $id) {
      id
      recommendations(page: $page, sort: [RATING_DESC, ID]) {
        ...RecommendationConnectionFields
      }
    }
  }
  ${RECOMMENDATION_CONNECTION_FIELDS}
`;

export const GET_STAFF = gql`
  query getStaff($id: Int!, $page: Int) {
    Media(id: $id) {
      id
      staff(page: $page, sort: [RELEVANCE, ID]) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        ...StaffConnectionFields
      }
    }
  }
  ${STAFF_CONNECTION_FIELDS}
`;

export const GET_CHARACTERS = gql`
  query getCharacters($id: Int!, $page: Int) {
    Media(id: $id) {
      id
      characters(page: $page, sort: [ROLE, RELEVANCE, ID]) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        ...CharacterConnectionFields
      }
    }
  }
  ${CHARACTER_CONNECTION_FIELDS}
`;

export const BROWSE_MEDIA = gql`
  query browseMedia (
    $page: Int,
    $id: Int,
    $type: MediaType,
    $isAdult: Boolean = false,
    $format: [MediaFormat],
    $status: MediaStatus,
    $countryOfOrigin: CountryCode,
    $source: MediaSource,
    $season: MediaSeason,
    $seasonYear: Int,
    $year: String,
    $yearLesser: FuzzyDateInt,
    $yearGreater: FuzzyDateInt,
    $episodeLesser: Int,
    $episodeGreater: Int,
    $durationLesser: Int,
    $durationGreater: Int,
    $chapterLesser: Int,
    $chapterGreater: Int,
    $volumeLesser: Int,
    $volumeGreater: Int,
    $genres: [String],
    $excludedGenres: [String],
    $tags: [String],
    $excludedTags: [String],
    $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]
  ) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        id: $id,
        type: $type,
        season: $season,
        format_in: $format,
        status: $status,
        countryOfOrigin: $countryOfOrigin,
        source: $source,
        seasonYear: $seasonYear,
        startDate_like: $year,
        startDate_lesser: $yearLesser,
        startDate_greater: $yearGreater,
        episodes_lesser: $episodeLesser,
        episodes_greater: $episodeGreater,
        duration_lesser: $durationLesser,
        duration_greater: $durationGreater,
        chapters_lesser: $chapterLesser,
        chapters_greater: $chapterGreater,
        volumes_lesser: $volumeLesser,
        volumes_greater: $volumeGreater,
        genre_in: $genres,
        genre_not_in: $excludedGenres,
        tag_in: $tags,
        tag_not_in: $excludedTags,
        sort: $sort,
        isAdult: $isAdult
      ) {
        ...MediaFields
        staff(perPage: 8, sort: [RELEVANCE, ID]) {
          ...StaffConnectionFields
        }
        studios {
          ...StudioConnectionFields
        }
      }
    }
  }
  ${MEDIA_FIELDS}
  ${STAFF_CONNECTION_FIELDS}
  ${STUDIO_CONNECTION_FIELDS}
`;

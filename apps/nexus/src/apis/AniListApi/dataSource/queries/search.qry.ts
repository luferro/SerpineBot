import { gql } from "graphql-tag";
import { CHARACTER_FIELDS } from "../fragments/character.fragment.js";
import { MEDIA_FIELDS } from "../fragments/media.fragment.js";
import { STAFF_FIELDS } from "../fragments/staff.fragment.js";
import { STUDIO_FIELDS } from "../fragments/studio.fragment.js";

export const MULTISEARCH = gql`
  query multiseach($query: String!, $isMature: Boolean) {
    anime: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: ANIME, isAdult: $isMature, search: $query) {
        ...MediaFields
      }
    }
    manga: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: MANGA, isAdult: $isMature, search: $query) {
        ...MediaFields
      }
    }
    characters: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: characters(search: $query) {
        ...CharacterFields
      }
    }
    staff: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: staff(search: $query) {
        ...StaffFields
      }
    }
    studios: Page(perPage: 13) {
      pageInfo {
        total
      }
      results: studios(search: $query) {
        ...StudioFields
      }
    }
  }
  ${MEDIA_FIELDS}
  ${CHARACTER_FIELDS}
  ${STAFF_FIELDS}
  ${STUDIO_FIELDS}
`;

export const GET_GENRES = gql`
    query getGenres {
      GenreCollection
    }
`;

export const GET_TAGS = gql`
    query getTags {
      MediaTagCollection {
        name
        description
        category
        isAdult
      }
    }
`;

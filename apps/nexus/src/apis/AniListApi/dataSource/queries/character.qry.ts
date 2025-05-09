import { gql } from "graphql-tag";
import { CHARACTER_FIELDS } from "../fragments/character.fragment.js";
import { MEDIA_FIELDS } from "../fragments/media.fragment.js";
import { STAFF_FIELDS } from "../fragments/staff.fragment.js";

export const GET_CHARACTER_BY_ID = gql`
    query getCharacterById(
      $id: Int!
      $page: Int
      $sort: [MediaSort] = [POPULARITY_DESC]
      $withRoles: Boolean = false
    ) {
      Character(id: $id) {
        ...CharacterFields
        media(page: $page, sort: $sort) @include(if: $withRoles) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          edges {
            id
            characterRole
            voiceActorRoles(language: JAPANESE, sort: [RELEVANCE, ID]) {
              voiceActor {
                ...StaffFields
              }
            }
            node {
              ...MediaFields
            }
          }
        }
      }
    }
    ${CHARACTER_FIELDS}
    ${STAFF_FIELDS}
    ${MEDIA_FIELDS}
  `;

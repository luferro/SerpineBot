import { gql } from "graphql-tag";
import { CHARACTER_FIELDS } from "../fragments/character.fragment.js";
import { MEDIA_FIELDS } from "../fragments/media.fragment.js";
import { STAFF_FIELDS } from "../fragments/staff.fragment.js";

export const GET_STAFF_BY_ID = gql`
  query getStaffById(
    $id: Int!
    $sort: [MediaSort] = [START_DATE_DESC]
    $characterPage: Int
    $staffPage: Int
    $type: MediaType
    $withCharacterRoles: Boolean = false
    $withStaffRoles: Boolean = false
  ) {
    Staff(id: $id) {
      ...StaffFields
      characterMedia(page: $characterPage, sort: $sort)
        @include(if: $withCharacterRoles) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          characterRole
          characterName
          node {
            ...MediaFields
          }
          characters {
            ...CharacterFields
          }
        }
      }
      staffMedia(page: $staffPage, type: $type, sort: $sort)
        @include(if: $withStaffRoles) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          staffRole
          node {
            ...MediaFields
          }
        }
      }
    }
  }
  ${STAFF_FIELDS}
  ${CHARACTER_FIELDS}
  ${MEDIA_FIELDS}
`;

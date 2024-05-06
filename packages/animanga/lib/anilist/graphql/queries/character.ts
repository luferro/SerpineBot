import { graphql } from "../../__generated__/index.js";

export const GET_CHARACTER_BY_ID = graphql(`
  query getCharacterById(
    $id: Int
    $page: Int
    $sort: [MediaSort]
    $withRoles: Boolean = false
  ) {
    Character(id: $id) {
      ...CharacterFields
      description
      age
      gender
      bloodType
      dateOfBirth {
        year
        month
        day
      }
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
            id
            idMal
            title {
              ...MediaTitleFields
            }
            coverImage {
              medium
              large
              extraLarge
            }
            format
            type
            status(version: 2)
          }
        }
      }
    }
  }
`);

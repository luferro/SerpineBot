import { graphql } from "../../__generated__/index.js";

export const GET_STAFF_BY_ID = graphql(`
  query staff(
    $id: Int
    $sort: [MediaSort]
    $characterPage: Int
    $staffPage: Int
    $type: MediaType
    $withCharacterRoles: Boolean = false
    $withStaffRoles: Boolean = false
  ) {
    Staff(id: $id) {
      id
      name {
        full
      }
      image {
        large
      }
      description
      age
      gender
      yearsActive
      homeTown
      bloodType
      primaryOccupations
      dateOfBirth {
        year
        month
        day
      }
      dateOfDeath {
        year
        month
        day
      }
      languageV2
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
            startDate {
              year
            }
            format
            type
            status(version: 2)
          }
          characters {
            id
            name {
              full
            }
            image {
              large
            }
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
            startDate {
              year
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

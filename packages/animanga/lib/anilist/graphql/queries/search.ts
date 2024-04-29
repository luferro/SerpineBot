import { graphql } from "../../__generated__/index.js";

export const SEARCH = graphql(`
  query search($query: String, $isMature: Boolean) {
    anime: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: ANIME, isAdult: $isMature, search: $query) {
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
        bannerImage
        season
        seasonYear
        isAdult
        status
        type
        format
        isLicensed
      }
    }
    manga: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: MANGA, isAdult: $isMature, search: $query) {
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
        bannerImage
        startDate {
          year
        }
        isAdult
        status
        type
        format
        isLicensed
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

`);

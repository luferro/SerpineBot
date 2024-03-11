import { graphql } from "../../__generated__";

export const SEARCH = graphql(`
  query search($search: String, $isMature: Boolean) {
    anime: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: ANIME, isAdult: $isMature, search: $search) {
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
        type
        format
        isLicensed
      }
    }
    manga: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: media(type: MANGA, isAdult: $isMature, search: $search) {
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
        type
        format
        isLicensed
      }
    }
    characters: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: characters(search: $search) {
        ...CharacterFields
      }
    }
    staff: Page(perPage: 8) {
      pageInfo {
        total
      }
      results: staff(search: $search) {
        ...StaffFields
      }
    }
    studios: Page(perPage: 13) {
      pageInfo {
        total
      }
      results: studios(search: $search) {
        ...StudioFields
      }
    }
  }

`);

import { graphql } from "../../__generated__";

export const GET_MEDIA = graphql(`
  query getMedia($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
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
        month
        day
      }
      endDate {
        year
        month
        day
      }
      description
      season
      seasonYear
      type
      format
      status(version: 2)
      episodes
      duration
      genres
      source(version: 3)
      isAdult
      meanScore
      averageScore
      popularity
      countryOfOrigin
      isLicensed
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        ...MediaConnectionFields
      }
      characters(perPage: 6, sort: [ROLE, RELEVANCE, ID]) {
        ...CharacterConnectionFields
      }
      staff(perPage: 8, sort: [RELEVANCE, ID]) {
        ...StaffConnectionFields
      }
      studios {
        ...StudioConnectionFields
      }
      recommendations(perPage: 10, sort: [RATING_DESC, ID]) {
        ...RecommendationConnectionFields
      }
      externalLinks {
        id
        site
        url
        type
        language
        color
        icon
        notes
        isDisabled
      }
      trailer {
        id
        site
      }
      rankings {
        id
        rank
        type
        year
        allTime
        context
      }
      stats {
        statusDistribution {
          status
          amount
        }
        scoreDistribution {
          score
          amount
        }
      }
    }
  }
`);

export const GET_RECOMMENDATIONS = graphql(`
  query getRecommendations($id: Int, $page: Int) {
    Media(id: $id) {
      id
      title {
        ...MediaTitleFields
      }
      recommendations(page: $page, sort: [RATING_DESC, ID]) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        nodes {
          ...RecommendationFields
        }
      }
    }
  }
`);

export const GET_CHARACTERS = graphql(`
  query getCharacters($id: Int, $page: Int) {
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
`);

export const GET_STAFF = graphql(`
  query getStaff($id: Int, $page: Int) {
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
`);

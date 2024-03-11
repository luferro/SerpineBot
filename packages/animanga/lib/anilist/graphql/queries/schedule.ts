import { graphql } from "../../__generated__";

export const GET_SCHEDULE = graphql(`
  query getSchedule($page: Int, $start: Int, $end: Int) {
    Page(page: $page) {
      pageInfo {
        hasNextPage
        total
      }
      airingSchedules(airingAt_greater: $start, airingAt_lesser: $end) {
        id
        episode
        airingAt
        media {
          id
          idMal
          title {
            ...MediaTitleFields
          }
          status
          season
          seasonYear
          type
          format
          duration
          episodes
          source(version: 2)
          countryOfOrigin
          meanScore
          averageScore
          description
          isAdult
          coverImage {
            medium
            large
            extraLarge
          }
          bannerImage
          externalLinks {
            type
            site
            url
          }
          rankings {
            id
            rank
            type
            year
            allTime
            context
          }
          studios(isMain: true) {
            nodes {
              ...StudioFields
            }
          }
        }
      }
    }
  }
`);

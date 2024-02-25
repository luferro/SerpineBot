import { graphql } from "../../../__generated__";

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
          format
          duration
          episodes
          source(version: 2)
          countryOfOrigin
          averageScore
          siteUrl
          description
          isAdult
          coverImage {
            medium
            large
            extraLarge
          }
          externalLinks {
            type
            site
            url
          }
          rankings {
            rank
            type
            season
            allTime
          }
          studios(isMain: true) {
            nodes {
              ...StudioFields
            }
          }
          relations {
            ...MediaConnectionFields
          }
        }
      }
    }
  }
`);

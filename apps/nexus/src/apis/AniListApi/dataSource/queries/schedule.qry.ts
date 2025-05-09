import { gql } from "graphql-tag";
import { MEDIA_FIELDS } from "../fragments/media.fragment.js";

export const GET_AIRING_SCHEDULE = gql`
  query getRawAiringSchedule($page: Int, $start: Int!, $end: Int!) {
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
          ...MediaFields
          studios(isMain: true) {
            nodes {
              id
              name
            }
          }
        }
      }
    }
  }
  ${MEDIA_FIELDS}
`;

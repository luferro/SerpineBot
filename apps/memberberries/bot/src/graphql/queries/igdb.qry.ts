import { gql } from "~/graphql/__generated__/gql.js";

export const GET_IGDB_UPCOMING_EVENTS = gql(`
  query GetIgdbUpcomingEvents {
    igdb {
      upcomingEvents {
        id
        name
        image
        description
        scheduledStartAt
        scheduledEndAt
        url
      }
    }
  }
`);

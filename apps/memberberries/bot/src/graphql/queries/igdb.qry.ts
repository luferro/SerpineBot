import { gql } from "~/graphql/__generated__/gql.js";

export const GET_IGDB_UPCOMING_EVENTS = gql(`
  query GetIgdbUpcomingEvents {
    igdb {
      upcomingEvents {
        name
        image
        description
        scheduledStartAt
        scheduledEndAt
        url {
          youtube
          twitch
        }
      }
    }
  }
`);

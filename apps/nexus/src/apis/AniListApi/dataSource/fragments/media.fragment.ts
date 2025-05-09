import { gql } from "graphql-tag";
import { CHARACTER_CONNECTION_FIELDS } from "./character.fragment.js";
import { STAFF_CONNECTION_FIELDS } from "./staff.fragment.js";
import { STUDIO_CONNECTION_FIELDS } from "./studio.fragment.js";

export const MEDIA_FIELDS = gql`
  fragment MediaFields on Media {
    __typename
    id
    idMal
    title {
      romaji
      english
      native
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
    chapters
    volumes
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
      format
      season
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
`;

export const RECOMMENDATION_FIELDS = gql`
  fragment RecommendationFields on Recommendation {
    __typename
    id
    rating
    mediaRecommendation {
      ...MediaFields
    }
  }
  ${MEDIA_FIELDS}
`;

export const MEDIA_CONNECTION_FIELDS = gql`
  fragment MediaConnectionFields on MediaConnection {
    edges {
      id
      relationType(version: 2)
      node {
        ...MediaFields
      }
    }
  }
  ${MEDIA_FIELDS}
`;

export const RECOMMENDATION_CONNECTION_FIELDS = gql`
  fragment RecommendationConnectionFields on RecommendationConnection {
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
  ${RECOMMENDATION_FIELDS}
`;

export const MEDIA_CONNECTIONS = gql`
  fragment MediaConnections on Media {
    relations {
      ...MediaConnectionFields
    }
    recommendations(perPage: 10, sort: [RATING_DESC, ID]) {
      ...RecommendationConnectionFields
    }
    characters(perPage: 6, sort: [ROLE, RELEVANCE, ID]) {
      ...CharacterConnectionFields
    }
    staff(perPage: 6, sort: [RELEVANCE, ID]) {
      ...StaffConnectionFields
    }
    studios {
      ...StudioConnectionFields
    }
  }
  ${MEDIA_CONNECTION_FIELDS}
  ${RECOMMENDATION_CONNECTION_FIELDS}
  ${CHARACTER_CONNECTION_FIELDS}
  ${STAFF_CONNECTION_FIELDS}
  ${STUDIO_CONNECTION_FIELDS}
`;

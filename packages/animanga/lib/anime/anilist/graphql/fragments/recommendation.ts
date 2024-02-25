import { graphql } from "../../../__generated__";

export const RECOMMENDATION_FIELDS = graphql(`
  fragment RecommendationFields on Recommendation {
    id
    rating
    mediaRecommendation {
      id
      title {
        ...MediaTitleFields
      }
      format
      type
      status(version: 2)
      bannerImage
      coverImage {
        large
      }
    }
  }
`);

export const RECOMMENDATION_CONNECTION_FIELDS = graphql(`
  fragment RecommendationConnectionFields on RecommendationConnection {
    pageInfo {
      total
    }
    nodes {
      ...RecommendationFields
    }
  }
`);

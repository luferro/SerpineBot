import { gql } from "graphql-tag";

export const STUDIO_FIELDS = gql`
  fragment StudioFields on Studio {
    __typename
    id
    name
    isAnimationStudio
  }
`;

export const STUDIO_CONNECTION_FIELDS = gql`
  fragment StudioConnectionFields on StudioConnection {
    edges {
      isMain
      node {
        ...StudioFields
      }
    }
  }
  ${STUDIO_FIELDS}
`;

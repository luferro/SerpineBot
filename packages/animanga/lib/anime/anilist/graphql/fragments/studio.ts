import { graphql } from "../../../__generated__";

export const STUDIO_FIELDS = graphql(`
  fragment StudioFields on Studio {
    id
    name
  }
`);

export const STUDIO_CONNECTION_FIELDS = graphql(`
  fragment StudioConnectionFields on StudioConnection {
    edges {
      isMain
      node {
        ...StudioFields
      }
    }
  }
`);

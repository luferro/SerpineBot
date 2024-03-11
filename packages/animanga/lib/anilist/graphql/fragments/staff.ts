import { graphql } from "../../__generated__";

export const STAFF_FIELDS = graphql(`
  fragment StaffFields on Staff {
    id
    name {
      full
    }
    languageV2
    image {
      large
    }
  }
`);

export const STAFF_CONNECTION_FIELDS = graphql(`
  fragment StaffConnectionFields on StaffConnection {
    edges {
      id
      role
      node {
        ...StaffFields
      }
    }
  }
`);

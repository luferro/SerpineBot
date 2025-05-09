import { gql } from "graphql-tag";

export const STAFF_FIELDS = gql`
  fragment StaffFields on Staff {
    __typename
    id
    name {
      full
    }
    languageV2
    image {
      large
    }
    description
    age
    gender
    yearsActive
    homeTown
    bloodType
    primaryOccupations
    dateOfBirth {
      day
      month
      year
    }
    dateOfDeath {
      day
      month
      year
    }
  }
`;

export const STAFF_CONNECTION_FIELDS = gql`
  fragment StaffConnectionFields on StaffConnection {
      edges {
        id
        role
        node {
          ...StaffFields
        }
      }
  }
  ${STAFF_FIELDS}
`;

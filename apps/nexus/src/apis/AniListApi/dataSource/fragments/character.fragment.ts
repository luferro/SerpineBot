import { gql } from "graphql-tag";
import { STAFF_FIELDS } from "./staff.fragment.js";

export const CHARACTER_FIELDS = gql`
  fragment CharacterFields on Character {
    __typename
    id
    name {
      full
    }
    image {
      large
    }
    description
    age
    gender
    bloodType
    dateOfBirth {
      day
      month
      year
    }
  }
`;

export const CHARACTER_CONNECTION_FIELDS = gql`
  fragment CharacterConnectionFields on CharacterConnection {
    edges {
      id
      role
      voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
        ...StaffFields
      }
      node {
        ...CharacterFields
      }
    }
  }
  ${STAFF_FIELDS}
  ${CHARACTER_FIELDS}
`;

import { graphql } from "../../__generated__";

export const CHARACTER_FIELDS = graphql(`
  fragment CharacterFields on Character {
    id
    name {
      full
    }
    image {
      large
    }
  }
`);

export const CHARACTER_CONNECTION_FIELDS = graphql(`
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
`);

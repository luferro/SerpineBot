import { graphql } from "../../__generated__/index.js";

export const MEDIA_TITLE_FIELDS = graphql(`
  fragment MediaTitleFields on MediaTitle {
    romaji
    english
    native
  }
`);

export const MEDIA_CONNECTION = graphql(`
  fragment MediaConnectionFields on MediaConnection {
    edges {
      id
      relationType(version: 2)
      node {
        id
        type
        title {
          ...MediaTitleFields
        }
        coverImage {
          medium
          large
          extraLarge
        }
        format
        status(version: 2)
      }
    }
  }
`);

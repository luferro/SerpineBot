import { graphql } from "../../__generated__";

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
        title {
          ...MediaTitleFields
        }
        format
        type
        status(version: 2)
        bannerImage
        coverImage {
          medium
          large
          extraLarge
        }
      }
    }
  }
`);

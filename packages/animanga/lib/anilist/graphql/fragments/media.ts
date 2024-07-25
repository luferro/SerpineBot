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

export const MEDIA_LIST = graphql(`
  fragment MediaListEntry on MediaList {
    id
    mediaId
    status
    score
    progress
    progressVolumes
    repeat
    priority
    private
    hiddenFromStatusLists
    customLists
    advancedScores
    notes
    updatedAt
    startedAt {
      year
      month
      day
    }
    completedAt {
      year
      month
      day
    }
    media {
      id
      title {
        ...MediaTitleFields
      }
      coverImage {
        medium
        large
        extraLarge
      }
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
      meanScore
      averageScore
      popularity
      isAdult
      countryOfOrigin
    }
  }
`);

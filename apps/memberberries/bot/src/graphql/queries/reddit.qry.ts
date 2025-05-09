import { gql } from "~/graphql/__generated__/gql.js";

export const GET_REDDIT_POSTS = gql(`
  query GetRedditPosts($input: RedditPostsInput!) {
    reddit {
      posts(input: $input) {
        title
        url
        selfurl
        selftext
        gallery {
          url
        }
        isSelf
        isCrosspost
        isNsfw
        isGallery
        isImage
        isVideo
        isYoutubeEmbed
        publishedAt
      }
    }
  }
`);

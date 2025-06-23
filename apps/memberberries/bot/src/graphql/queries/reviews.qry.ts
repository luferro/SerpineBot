import { gql } from "~/graphql/__generated__/gql.js";

export const SEARCH_REVIEW = gql(`
  query SearchReview($query: String!) {
    reviews {
      search(query: $query) {
        title
        url
        score
      }
    }
  }
`);

export const GET_REVIEW = gql(`
  query GetReview($url: String!) {
    reviews {
      review(url: $url) {
        title
        url
        image
        description
        releaseDate
        genres
        platforms
        aggregateRating {
          tier
          ratingValue
          reviewCount
        }
        developers
        publishers
      }
    }
  }
`);

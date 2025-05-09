import { gql } from "~/graphql/__generated__/gql.js";

export const SEARCH_HLTB = gql(`
  query SearchHltb($query: String!) {
    hltb {
      search(query: $query) {
        id
        title
        releaseYear
      }
    }
  }
`);

export const GET_HLTB_PLAYTIMES = gql(`
  query GetHltbPlaytimes($id: String!) {
    hltb {
      playtimes(id: $id) {
        id
        title
        url
        image
        main
        mainExtra
        completionist
      }
    }
  }
`);

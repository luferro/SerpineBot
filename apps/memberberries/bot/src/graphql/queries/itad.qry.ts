import { gql } from "~/graphql/__generated__/gql.js";

export const SEARCH_ITAD = gql(`
  query SearchItad($query: String!) {
    itad {
      search(query: $query) {
        id
        title
      }
    }
  }
`);

export const GET_ITAD_DEAL = gql(`
  query GetItadDeal($input: ItadDealInput!) {
    itad {
      deal(input: $input) {
        id
        appId
        slug
        title
        image
        releaseDate
        reviews {
          score
          source
          count
          url
        }
        playerCount {
          recent
          day
          week
          peak
        }
        isEarlyAccess
        hasAchievements
        hasTradingCards
        historicalLow {
          all {
            amount
            amountInt
            currency
          }
          y1 {
            amount
            amountInt
            currency
          }
          m3 {
            amount
            amountInt
            currency
          }
        }
        deals {
          url
          voucher
          store
          regular {
            amount
            amountInt
            currency
          }
          discounted {
            amount
            amountInt
            currency
          }
          storeHistoricalLow {
            amount
            amountInt
            currency
          }
          discount
          drm
          platforms
          timestamp
          expiry
        }
        bundles {
          id
          title
          url
          store
          tiers {
            price {
              amount
              amountInt
              currency
            }
            games {
              id
              slug
              title
              type
              mature
            }
          }
          timestamp
          expiry
        }
      }
    }
  }
`);

export const GET_ITAD_FREEBIES = gql(`
  query GetItadFreebies($country: String) {
    itad {
      freebies(country: $country) {
        id
        slug
        title
        type
        url
        voucher
        store
        regular {
          amount
          amountInt
          currency
        }
        discounted {
          amount
          amountInt
          currency
        }
        discount
        drm
        platforms
        timestamp
        expiry
      }
    }
  }
`);

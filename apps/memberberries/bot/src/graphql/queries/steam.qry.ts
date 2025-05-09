import { gql } from "~/graphql/__generated__/gql.js";

export const SEARCH_STEAM_APPS = gql(`
  query SearchSteamApps($query: String!) {
    steam {
      search(query: $query) {
        appId
        title
        url
        image
        price
      }
    }
  }
`);

export const GET_STEAM_ID_64 = gql(`
  query GetSteamId64($vanityUrl: String!) {
    steam {
      steamId64(vanityUrl: $vanityUrl)
    }
  }
`);

export const GET_STEAM_PROFILE = gql(`
  query GetSteamProfile($steamId64: String!) {
    steam {
      profile(steamId64: $steamId64) {
        id
        name
        image
        status
        logoutAt
        createdAt
      }
    }
  }
`);

export const GET_STEAM_RECENTLY_PLAYED = gql(`
  query GetSteamRecentlyPlayed($steamId64: String!) {
    steam {
      recentlyPlayed(steamId64: $steamId64) {
        id
        title
        url
        totalHours
        biweeklyHours
      }
    }
  }
`);

export const GET_STEAM_WISHLIST = gql(`
  query GetSteamWishlist($steamId64: String!) {
    steam {
      wishlist(steamId64: $steamId64) {
        priority
        id
        title
        url
        release {
          date
          customMessage
        }
        discount
        regular
        discounted
        isFree
        isReleased
        assets {
          capsule {
            hero
          }
        }
      }
    }
  }
`);

export const GET_STEAM_APP_PLAYER_COUNT = gql(`
  query GetSteamAppPlayerCount($appId: Int!) {
    steam {
      playerCount(appId: $appId)
    }
  }
`);

export const GET_STEAM_APPS = gql(`
  query GetSteamApps($appIds: [Int!]!) {
    steam {
      store(appIds: $appIds) {
        id
        title
        url
        release {
          date
          customMessage
        }
        description
        discount
        regular
        discounted
        isFree
        isReleased
        isGiftable
        developers
        publishers
        franchises
        screenshots
        trailers {
          title
          trailer {
            sd
            max
          }
        }
        assets {
          capsule {
            hero
          }
        }
      }
    }
  }
`);

export const GET_STEAM_UPCOMING_SALES = gql(`
  query GetSteamUpcomingSales {
    steam {
      upcomingSales {
        sale
        status
        upcoming
      }
    }
  }
`);

export const GET_STEAM_CHART = gql(`
  query GetSteamChart($chart: SteamChartType!) {
    steam {
      chart(chart: $chart) {
        position
        name
        url
        count
      }
    }
  }
`);

import { graphql } from "../../__generated__/index.js";

export const GET_MEDIA = graphql(`
  query getMedia($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      id
      idMal
      title {
        ...MediaTitleFields
      }
      coverImage {
        medium
        large
        extraLarge
      }
      bannerImage
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
      description
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
      isAdult
      meanScore
      averageScore
      popularity
      countryOfOrigin
      isLicensed
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        ...MediaConnectionFields
      }
      characters(perPage: 6, sort: [ROLE, RELEVANCE, ID]) {
        ...CharacterConnectionFields
      }
      staff(perPage: 8, sort: [RELEVANCE, ID]) {
        ...StaffConnectionFields
      }
      studios {
        ...StudioConnectionFields
      }
      recommendations(perPage: 10, sort: [RATING_DESC, ID]) {
        ...RecommendationConnectionFields
      }
      externalLinks {
        id
        site
        url
        type
        language
        color
        icon
        notes
        isDisabled
      }
      trailer {
        id
        site
      }
      rankings {
        id
        rank
        type
        year
        allTime
        format
        season
        context
      }
      stats {
        statusDistribution {
          status
          amount
        }
        scoreDistribution {
          score
          amount
        }
      }
    }
  }
`);

export const GET_RECOMMENDATIONS = graphql(`
  query getRecommendations($id: Int, $page: Int) {
    Media(id: $id) {
      id
      title {
        ...MediaTitleFields
      }
      recommendations(page: $page, sort: [RATING_DESC, ID]) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        nodes {
          ...RecommendationFields
        }
      }
    }
  }
`);

export const GET_CHARACTERS = graphql(`
  query getCharacters($id: Int, $page: Int) {
    Media(id: $id) {
      id
      characters(page: $page, sort: [ROLE, RELEVANCE, ID]) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        ...CharacterConnectionFields
      }
    }
  }
`);

export const GET_STAFF = graphql(`
  query getStaff($id: Int, $page: Int) {
    Media(id: $id) {
      id
      staff(page: $page, sort: [RELEVANCE, ID]) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        ...StaffConnectionFields
      }
    }
  }
`);

export const BROWSE_MEDIA = graphql(`
  query browseMedia (
    $page: Int,
    $id: Int,
    $type: MediaType,
    $isAdult: Boolean = false,
    $format: [MediaFormat],
    $status: MediaStatus,
    $countryOfOrigin: CountryCode,
    $source: MediaSource,
    $season: MediaSeason,
    $seasonYear: Int,
    $year: String,
    $yearLesser: FuzzyDateInt,
    $yearGreater: FuzzyDateInt,
    $episodeLesser: Int,
    $episodeGreater: Int,
    $durationLesser: Int,
    $durationGreater: Int,
    $chapterLesser: Int,
    $chapterGreater: Int,
    $volumeLesser: Int,
    $volumeGreater: Int,
    $genres: [String],
    $excludedGenres: [String],
    $tags: [String],
    $excludedTags: [String],
    $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]
  ) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        id: $id,
        type: $type,
        season: $season,
        format_in: $format,
        status: $status,
        countryOfOrigin: $countryOfOrigin,
        source: $source,
        seasonYear: $seasonYear,
        startDate_like: $year,
        startDate_lesser: $yearLesser,
        startDate_greater: $yearGreater,
        episodes_lesser: $episodeLesser,
        episodes_greater: $episodeGreater,
        duration_lesser: $durationLesser,
        duration_greater: $durationGreater,
        chapters_lesser: $chapterLesser,
        chapters_greater: $chapterGreater,
        volumes_lesser: $volumeLesser,
        volumes_greater: $volumeGreater,
        genre_in: $genres, genre_not_in:
        $excludedGenres,
        tag_in: $tags,
        tag_not_in: $excludedTags,
        sort: $sort,
        isAdult: $isAdult
      ) {
        id
        idMal
        title {
          ...MediaTitleFields
        }
        coverImage {
          medium
          large
          extraLarge
        }
        bannerImage
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
        description
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
        isAdult
        meanScore
        averageScore
        popularity
        countryOfOrigin
        isLicensed
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
        studios {
          ...StudioConnectionFields
        }
        externalLinks {
          id
          site
          url
          type
          language
          color
          icon
          notes
          isDisabled
        }
        rankings {
          id
          rank
          type
          year
          allTime
          context
        }
      }
    }
  }
`);

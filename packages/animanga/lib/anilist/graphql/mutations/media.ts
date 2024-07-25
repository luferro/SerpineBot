import { graphql } from "../../__generated__/gql.js";

export const SAVE_MEDIA = graphql(`
    mutation saveMedia (
        $id: Int
        $mediaId: Int
        $status: MediaListStatus
        $score: Float
        $progress: Int
        $progressVolumes: Int
        $repeat: Int
        $private: Boolean
        $notes: String
        $customLists: [String]
        $hiddenFromStatusLists: Boolean
        $advancedScores: [Float]
        $startedAt: FuzzyDateInput
        $completedAt: FuzzyDateInput
        ) {
        SaveMediaListEntry(
            id: $id
            mediaId: $mediaId
            status: $status
            score: $score
            progress: $progress
            progressVolumes: $progressVolumes
            repeat: $repeat
            private: $private
            notes: $notes
            customLists: $customLists
            hiddenFromStatusLists: $hiddenFromStatusLists
            advancedScores: $advancedScores
            startedAt: $startedAt
            completedAt: $completedAt
        ) {
            id
            mediaId
            status
            score
            advancedScores
            progress
            progressVolumes
            repeat
            priority
            private
            hiddenFromStatusLists
            customLists
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
            user {
            id
            name
            }
            media {
            id
            title {
                userPreferred
            }
            coverImage {
                large
            }
            type
            format
            status
            episodes
            volumes
            chapters
            averageScore
            popularity
            isAdult
            startDate {
                year
            }
            }
        }
    }
`);

export const DELETE_MEDIA = graphql(`
    mutation deleteMedia ($id: Int) {
        DeleteMediaListEntry(id: $id) {
            deleted
        }
    }
`);

export const TOGGLE_FAVORITE = graphql(`
    mutation toggleFavorite (
        $animeId: Int
        $mangaId: Int
        $characterId: Int
        $staffId: Int
        $studioId: Int
        ) {
        ToggleFavourite(
            animeId: $animeId
            mangaId: $mangaId
            characterId: $characterId
            staffId: $staffId
            studioId: $studioId
        ) {
            anime {
            pageInfo {
                total
            }
            }
            manga {
            pageInfo {
                total
            }
            }
            characters {
            pageInfo {
                total
            }
            }
            staff {
            pageInfo {
                total
            }
            }
            studios {
            pageInfo {
                total
            }
            }
        }
    }
`);

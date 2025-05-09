import { gql } from "graphql-tag";
import { MEDIA_FIELDS } from "../fragments/media.fragment.js";
import { STUDIO_FIELDS } from "../fragments/studio.fragment.js";

export const GET_STUDIO_BY_ID = gql`
  query getStudioById ($id: Int!, $page: Int, $sort: [MediaSort] = [START_DATE_DESC]) {
		Studio(id: $id) {
      ...StudioFields
			media(page: $page, sort: $sort) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          isMainStudio
          node {
            ...MediaFields
          }
        }
			}
		}
	}
  ${MEDIA_FIELDS}
  ${STUDIO_FIELDS}
`;

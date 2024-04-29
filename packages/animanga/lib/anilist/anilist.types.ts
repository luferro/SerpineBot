import type { AniListApi } from "./anilist.api.js";

export * from "./__generated__/graphql.js";

export type Media = Awaited<ReturnType<AniListApi["getMediaById"]>>;
type ScheduleMedia = NonNullable<ReturnType<Awaited<ReturnType<AniListApi["getAiringSchedule"]>>["get"]>>[0];
type BrowseMedia = Awaited<ReturnType<AniListApi["browse"]>>["media"][0];
type CommonFields = Pick<Media & ScheduleMedia & BrowseMedia, keyof Media & keyof ScheduleMedia & keyof BrowseMedia>;
export type MergedMedia = Partial<Media & ScheduleMedia & BrowseMedia> & CommonFields;

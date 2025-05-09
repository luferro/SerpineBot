import { type AugmentedRequest, type CacheOptions, ExtendedRESTDataSource } from "@luferro/graphql/server";
import { capitalize } from "@luferro/utils/data";

import type { Chapter, Manga, Payload } from "./dtos/MangadexApiDtos.js";

export class MangadexDataSource extends ExtendedRESTDataSource {
	override readonly baseURL = "https://api.mangadex.org";
	protected readonly token: string;

	constructor({ token }: { token: string }) {
		super();
		this.token = token;
	}

	protected async willSendRequest(_path: string, request: AugmentedRequest<CacheOptions>) {
		request.headers.Authorization = this.token;
	}

	async search(title: string) {
		const results = await this.get<Payload<Manga[]>>("manga", { params: { title } });

		return results.data.map((result) => {
			const { title, links } = result.attributes;
			return {
				id: result.id,
				title: title.en ?? title["ja-ro"] ?? title.ja ?? title.jp,
				trackers: {
					aniList: links.al ?? null,
					myAnimeList: links.mal ?? null,
					animePlanet: links.ap ?? null,
				},
			};
		});
	}

	async getMangaById(id: string) {
		const manga = await this.get<Payload<Manga>>(`manga/${id}`);
		const {
			attributes: { title, status, year, tags },
		} = manga.data;

		const image = `https://og.mangadex.org/og-image/manga/${id}`;
		const release = year ? `${year}, ` : null;
		const publication = status ? capitalize(status) : null;

		return {
			id,
			image,
			title: title.en ?? title["ja-ro"] ?? title.ja ?? title.jp,
			url: `https://mangadex.org/title/${id}`,
			publication: release || publication ? `${release ?? ""} ${publication ?? ""}`.trim() : null,
			tags: tags.map((tag) => tag.attributes.name.en),
		};
	}

	async getLatestChapters(limit = 20) {
		const chapters = await this.get<Payload<Chapter[]>>("chapter", {
			params: {
				"originalLanguage[]": "ja",
				"translatedLanguage[]": "en",
				"order[readableAt]": "desc",
				"includes[]": "manga",
				limit: limit.toString(),
			},
		});

		return chapters.data.map(({ id, attributes: { title, chapter, externalUrl, readableAt }, relationships }) => ({
			mangaId: relationships.find(({ type }) => type === "manga")!.id,
			chapter: {
				id,
				readableAt: new Date(readableAt).getTime(),
				title: chapter || title ? `${chapter ? `Ch. ${chapter}` : ""} ${title ?? ""}`.trim() : "Oneshot",
				url: externalUrl ?? `https://mangadex.org/chapter/${id}`,
			},
		}));
	}
}

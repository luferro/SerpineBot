import { fetcher } from "@luferro/helpers/fetch";
import { capitalize } from "@luferro/helpers/transform";
import type { Chapter, Manga, Payload } from "./mangadex.types.js";

export class MangadexApi {
	private static BASE_URL = "https://mangadex.org";
	private static BASE_API_URL = "https://api.mangadex.org";
	private static BASE_IMAGE_URL = "https://og.mangadex.org";

	async search(query: string) {
		const { payload } = await fetcher<Payload<Manga[]>>(`${MangadexApi.BASE_API_URL}/manga?title=${query}`);

		return payload.data.map((result) => {
			const { title, links } = result.attributes;
			return {
				id: result.id,
				title: title.en ?? title["ja-ro"] ?? title.ja ?? title.jp,
				trackers: { aniList: links.al ?? null, myAnimeList: links.mal ?? null, animePlanet: links.ap ?? null },
			};
		});
	}

	async getMangaById(id: string) {
		const { payload } = await fetcher<Payload<Manga>>(`${MangadexApi.BASE_API_URL}/manga/${id}`);
		const { attributes } = payload.data;

		const { title, status, year, tags } = attributes;
		const image = `${MangadexApi.BASE_IMAGE_URL}/og-image/manga/${id}`;
		const release = year ? `${year}, ` : null;
		const publication = status ? capitalize(status) : null;

		return {
			id,
			image,
			title: title.en ?? title["ja-ro"] ?? title.ja ?? title.jp,
			url: `${MangadexApi.BASE_URL}/title/${id}`,
			publication: release || publication ? `${release ?? ""} ${publication ?? ""}`.trim() : null,
			tags: tags.map((tag) => tag.attributes.name.en),
		};
	}

	async getLatestChapters({ limit = 20 } = {}) {
		const { payload } = await fetcher<Payload<Chapter[]>>(
			`${MangadexApi.BASE_API_URL}/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&includes[]=manga&limit=${limit}`,
		);

		return payload.data.map(({ id, attributes: { title, chapter, externalUrl, readableAt }, relationships }) => ({
			mangaId: relationships.find(({ type }) => type === "manga")!.id,
			chapter: {
				id,
				readableAt,
				title: chapter || title ? `${chapter ? `Ch. ${chapter}` : ""} ${title ?? ""}`.trim() : "Oneshot",
				url: externalUrl ?? `${MangadexApi.BASE_URL}/chapter/${id}`,
			},
		}));
	}
}

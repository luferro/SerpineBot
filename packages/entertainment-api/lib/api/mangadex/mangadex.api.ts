import { FetchUtil, StringUtil } from '@luferro/shared-utils';

import { Id, Limit, Query } from '../../types/args';

type Payload<T> = { data: T };

type Relationship<T = unknown> = { id: string; type: 'manga' | 'cover_art'; attributes: T };

type Chapter = {
	id: string;
	attributes: {
		volume: string | null;
		chapter: string;
		title: string;
		externalUrl: string;
		publishedAt: string;
		readableAt: string;
	};
	relationships: Relationship[];
};

type Manga = {
	id: string;
	attributes: {
		title: { 'en': string; 'ja': string; 'jp': string; 'ja-ro': string };
		status: string;
		year: number;
		tags: { attributes: { name: { en: string } } }[];
	};
	relationships: Relationship<{ fileName: string }>[];
};

export class MangadexApi {
	private static BASE_URL = 'https://mangadex.org';
	private static BASE_API_URL = 'https://api.mangadex.org';
	private static BASE_IMAGE_URL = 'https://og.mangadex.org';

	async search({ query }: Query) {
		const { payload } = await FetchUtil.fetch<Payload<Manga[]>>({
			url: `${MangadexApi.BASE_API_URL}/manga?title=${query}`,
		});

		return payload.data.map((result) => {
			const { title } = result.attributes;
			return { id: result.id, title: title.en ?? title['ja-ro'] ?? title.ja ?? title.jp };
		});
	}

	async getMangaById({ id }: Id) {
		const { payload } = await FetchUtil.fetch<Payload<Manga>>({ url: `${MangadexApi.BASE_API_URL}/manga/${id}` });
		const { attributes } = payload.data;

		const { title, status, year, tags } = attributes;
		const image = `${MangadexApi.BASE_IMAGE_URL}/og-image/manga/${id}`;
		const release = year ? `${year}, ` : null;
		const publication = status ? StringUtil.capitalize(status) : null;

		return {
			id,
			image,
			title: title.en ?? title['ja-ro'] ?? title.ja ?? title.jp,
			url: `${MangadexApi.BASE_URL}/title/${id}`,
			publication: release || publication ? `${release ?? ''} ${publication ?? ''}`.trim() : null,
			tags: tags.map((tag) => tag.attributes.name.en),
		};
	}

	async getChapters({ limit = 20 }: Partial<Limit>) {
		const { payload } = await FetchUtil.fetch<Payload<Chapter[]>>({
			url: `${MangadexApi.BASE_API_URL}/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&includes[]=manga&limit=${limit}`,
		});

		return payload.data.map(({ id, attributes: { title, chapter, externalUrl, readableAt }, relationships }) => ({
			mangaId: relationships.find(({ type }) => type === 'manga')!.id,
			chapter: {
				id,
				readableAt,
				title: chapter || title ? `${chapter ? `Ch. ${chapter}` : ''} ${title ?? ''}`.trim() : 'Oneshot',
				url: externalUrl ?? `${MangadexApi.BASE_URL}/chapter/${id}`,
			},
		}));
	}
}

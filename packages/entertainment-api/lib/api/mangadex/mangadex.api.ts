import { FetchUtil, StringUtil } from '@luferro/shared-utils';

type Payload<T> = { data: T };

type Search = { id: number };

type Relationship<T = unknown> = {
	id: string;
	type: 'manga' | 'cover_art';
	attributes: T;
};

type Chapter = {
	id: string;
	attributes: { volume: string | null; chapter: string; title: string; externalUrl: string };
	relationships: Relationship[];
};

type Manga = {
	id: string;
	attributes: {
		title: { 'en': string; 'ja': string; 'jp': string; 'ja-ro': string };
		contentRating: string;
		status: string;
		year: number;
		tags: { attributes: { name: { en: string } } }[];
	};
	relationships: Relationship<{ fileName: string }>[];
};

export const search = async (query: string) => {
	const url = `https://api.mangadex.org/manga?title=${query}`;
	const { payload } = await FetchUtil.fetch<Payload<Search[]>>({ url });
	return { id: payload.data[0]?.id.toString() ?? null };
};

export const getMangaById = async (id: string) => {
	const url = `https://api.mangadex.org/manga/${id}?includes[]=cover_art`;
	const {
		payload: {
			data: { attributes, relationships },
		},
	} = await FetchUtil.fetch<Payload<Manga>>({ url });

	const { title, contentRating, status, year, tags } = attributes;
	const coverArt = relationships.find(({ type }) => type === 'cover_art');
	const image = coverArt ? `https://uploads.mangadex.org/covers/${id}/${coverArt.attributes.fileName}` : null;

	return {
		id,
		image,
		title: title.en ?? title.ja ?? title.jp ?? title['ja-ro'],
		url: `https://mangadex.org/title/${id}`,
		publication: `${year}, ${StringUtil.capitalize(status)}`,
		contentRating: StringUtil.capitalize(contentRating),
		tags: tags.map((tag) => tag.attributes.name.en),
	};
};

export const getLatestChapters = async (limit = 20) => {
	const url = `https://api.mangadex.org/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&includes[]=manga&limit=${limit}`;
	const { payload } = await FetchUtil.fetch<Payload<Chapter[]>>({ url });

	return payload.data.map(({ id, attributes: { title, chapter, externalUrl }, relationships }) => ({
		mangaId: relationships.find(({ type }) => type === 'manga')!.id,
		chapter: {
			id,
			title: chapter || title ? `${chapter ? `Ch. ${chapter}` : ''} ${title ?? ''}`.trim() : 'Oneshot',
			url: externalUrl ?? `https://mangadex.org/chapter/${id}`,
		},
	}));
};

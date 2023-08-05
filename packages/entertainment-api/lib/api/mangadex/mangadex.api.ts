import { FetchUtil } from '@luferro/shared-utils';

type Payload<T> = { data: T };

type Search = { id: number };

type Relationship = {
	id: string;
	type: string;
	related?: string;
	attributes: { description: string; volume: string; fileName: string };
};
type Chapter = {
	id: string;
	attributes: { volume: string | null; chapter: string; title: string; externalUrl: string };
	relationships: Relationship[];
};

type Manga = {
	id: string;
	attributes: { title: { 'en': string; 'ja': string; 'jp': string; 'ja-ro': string } };
	relationships: Relationship[];
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

	const { en, ja, jp, 'ja-ro': romaji } = attributes.title;
	const coverArt = relationships.find(({ type }) => type === 'cover_art');
	const image = coverArt ? `https://uploads.mangadex.org/covers/${id}/${coverArt.attributes.fileName}` : null;

	return {
		id,
		image,
		title: en ?? ja ?? jp ?? romaji,
		url: `https://mangadex.org/title/${id}`,
	};
};

export const getLastestChapters = async (limit = 20) => {
	const url = `https://api.mangadex.org/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&limit=${limit}`;
	const { payload } = await FetchUtil.fetch<Payload<Chapter[]>>({ url });

	return payload.data.map(({ id, attributes: { title, chapter, externalUrl }, relationships }) => {
		const manga = relationships.find(({ type }) => type === 'manga')!;

		const chapterNumber = chapter ? `Ch. ${chapter}` : '';
		const chapterTitle = title ?? '';

		return {
			mangaId: manga.id,
			chapterId: id,
			title: !chapter && !title ? 'Oneshot' : `${chapterNumber} ${chapterTitle}`.trim(),
			url: externalUrl ?? `https://mangadex.org/chapter/${id}`,
		};
	});
};

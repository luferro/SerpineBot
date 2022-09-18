import type { Chapter, Manga, MangadexResponse, SearchResult } from '../types/response';
import { FetchUtil } from '@luferro/shared-utils';

export const search = async (title: string) => {
	const data = await FetchUtil.fetch<MangadexResponse<SearchResult>>({
		url: `https://api.mangadex.org/manga?title=${title}`,
	});

	return {
		id: data.data[0]?.id.toString() ?? null,
	};
};

export const getMangaById = async (id: string) => {
	const {
		data: {
			attributes: {
				title: { en, ja, jp, 'ja-ro': romaji },
			},
			relationships,
		},
	} = await FetchUtil.fetch<Manga>({ url: `https://api.mangadex.org/manga/${id}?includes[]=cover_art` });

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
	const { data } = await FetchUtil.fetch<MangadexResponse<Chapter>>({
		url: `https://api.mangadex.org/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&limit=${limit}`,
	});

	return data.map(({ id, attributes: { title, chapter, externalUrl }, relationships }) => {
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

import { FetchUtil } from '@luferro/shared-utils';

import { MangadexChapter, MangadexManga, MangadexPayload, MangadexSearch } from '../../types/payload';

export const search = async (query: string) => {
	const url = `https://api.mangadex.org/manga?title=${query}`;
	const data = await FetchUtil.fetch<MangadexPayload<MangadexSearch[]>>({ url });
	const id = data.data[0]?.id.toString() ?? null;
	return { id };
};

export const getMangaById = async (id: string) => {
	const url = `https://api.mangadex.org/manga/${id}?includes[]=cover_art`;
	const {
		data: {
			attributes: {
				title: { en, ja, jp, 'ja-ro': romaji },
			},
			relationships,
		},
	} = await FetchUtil.fetch<MangadexPayload<MangadexManga>>({ url });

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
	const { data } = await FetchUtil.fetch<MangadexPayload<MangadexChapter[]>>({ url });

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

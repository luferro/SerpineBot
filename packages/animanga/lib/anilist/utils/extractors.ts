import { capitalize } from "@luferro/helpers/transform";
import {
	type Character,
	ExternalLinkType,
	type Media,
	type MediaExternalLink,
	type MediaList,
	type MediaRank,
	type Staff,
	type Studio,
	type User,
} from "../__generated__/graphql.js";

export function extractUser(user: User) {
	return {
		id: user.id.toString(),
		name: user.name,
		avatar: user.avatar ?? null,
		bannerImage: user.bannerImage ?? null,
	};
}

export function extractMediaFields(media: Media) {
	const formatRanking = (ranking: MediaRank) => {
		const formatted = [`#${ranking.rank} ${ranking.context}`];
		if (ranking.season) formatted.push(ranking.season);
		if (!ranking.allTime && ranking.year) formatted.push(ranking.year.toString());

		return formatted.join(" ");
	};

	return {
		id: media.id.toString(),
		malId: media.idMal ? media.idMal.toString() : null,
		type: media.type!,
		title: {
			romaji: media.title?.romaji ?? null,
			english: media.title?.english ?? null,
			native: media.title?.native ?? null,
		},
		coverImage: {
			medium: media.coverImage?.medium ?? null,
			large: media.coverImage?.large ?? null,
			extraLarge: media.coverImage?.extraLarge ?? null,
		},
		bannerImage: media.bannerImage ?? null,
		trailer: {
			id: media.trailer?.site === "youtube" ? media.trailer.id : null,
			url: media.trailer?.site === "youtube" ? `https://www.youtube.com/embed/${media.trailer.id}` : null,
		},
		description: media.description ?? null,
		isMature: !!media.isAdult,
		format: media.format?.replaceAll("_", " ") ?? null,
		status: media.status ? capitalize(media.status.replaceAll("_", " ").toLowerCase()) : null,
		source: media.source ?? null,
		isLicensed: !!media.isLicensed,
		countryOfOrigin: media.countryOfOrigin as string,
		startDate: media.startDate ?? null,
		endDate: media.endDate ?? null,
		genres: (media.genres ?? []) as string[],
		season: media.season && media.seasonYear ? `${capitalize(media.season.toLowerCase())} ${media.seasonYear}` : null,
		episodes: media.episodes ?? null,
		duration: media.duration ?? null,
		nextAiringEpisode: {
			episode: media.nextAiringEpisode?.episode ?? null,
			raw: { at: media.nextAiringEpisode ? media.nextAiringEpisode.airingAt * 1000 : null },
		},
		volumes: media.volumes ?? null,
		chapters: media.chapters ?? null,
		popularity: media.popularity ?? null,
		averageScore: media.averageScore ?? null,
		meanScore: media.meanScore ?? null,
		rankings: (media.rankings ?? [])
			.filter((ranking): ranking is MediaRank => !!ranking)
			.map((ranking) => ({ ...ranking, formatted: formatRanking(ranking) })),
	};
}

export function extractMediaList(mediaList: MediaList) {
	return {
		id: mediaList.id.toString(),
		status: mediaList.status!,
		priority: mediaList.priority ?? 0,
		progress: mediaList.progress ?? 0,
		progressVolumes: mediaList.progressVolumes ?? null,
		repeatCount: mediaList.repeat ?? 0,
		media: extractMediaFields(mediaList.media!),
		startedAt: mediaList.startedAt ?? null,
		completedAt: mediaList.completedAt ?? null,
	};
}

export function extractCharacter(character: Character) {
	return {
		id: character.id.toString(),
		name: character.name!.full!,
		image: character.image?.large ?? null,
		description: character.description ?? null,
		age: character.age ?? null,
		gender: character.gender ?? null,
		bloodType: character.bloodType ?? null,
		dateOfBirth: character.dateOfBirth ?? null,
	};
}

export function extractCharacters(media: Media) {
	return (media.characters?.edges ?? [])
		.map((edge) => {
			const node = edge?.node;
			if (!edge || !node?.name) return;

			const character = extractCharacter(node);
			const voiceActors = (edge.voiceActors ?? [])
				.map((voiceActor) => {
					if (!voiceActor?.name) return;
					return {
						id: voiceActor.id.toString(),
						name: voiceActor.name.full!,
						language: voiceActor.languageV2!,
						image: voiceActor.image?.large ?? null,
					};
				})
				.filter((voiceActor): voiceActor is NonNullable<typeof voiceActor> => !!voiceActor);
			return { role: edge.role!, character, voiceActors };
		})
		.filter((edge): edge is NonNullable<typeof edge> => !!edge);
}

export function extractStaffMember(staff: Staff) {
	return {
		id: staff.id.toString(),
		name: staff.name!.full!,
		language: staff.languageV2!,
		image: staff.image?.large ?? null,
		description: staff.description ?? null,
		age: staff.age ?? null,
		gender: staff.gender ?? null,
		yearsActive: staff.yearsActive ?? null,
		homeTown: staff.homeTown ?? null,
		bloodType: staff.bloodType ?? null,
		primaryOccupations: staff.primaryOccupations ?? [],
		dateOfBirth: staff.dateOfBirth ?? null,
		dateOfDeath: staff.dateOfDeath ?? null,
	};
}

export function extractStaff(media: Media) {
	return (media.staff?.edges ?? [])
		.map((edge) => {
			const node = edge?.node;
			if (!edge || !node?.name) return;

			const staff = extractStaffMember(node);

			return { role: edge.role!, staff };
		})
		.filter((edge): edge is NonNullable<typeof edge> => !!edge);
}

export function extractStudio(studio: Studio) {
	return { id: studio.id.toString(), name: studio.name };
}

export function extractStudios(media: Media) {
	return (media.studios?.edges ?? [])
		.map((edge) => {
			const node = edge?.node;
			if (!edge || !node) return;

			const studio = extractStudio(node);

			return { isMain: edge.isMain, studio };
		})
		.filter((edge): edge is NonNullable<typeof edge> => !!edge);
}

export function extractTrackers(media: Media) {
	const type = media.type!.toLowerCase();

	return [
		media.idMal ? { name: "MyAnimeList", url: `https://myanimelist.net/${type}/${media.idMal}` } : null,
		{ name: "AniList", url: `https://anilist.co/${type}/${media.id}` },
	].filter((tracker): tracker is NonNullable<typeof tracker> => !!tracker);
}

export function extractStreams(media: Media) {
	return (media.externalLinks ?? [])
		.filter((externalLink): externalLink is MediaExternalLink => externalLink?.type === ExternalLinkType.Streaming)
		.map((externalLink) => ({ name: externalLink.site, url: externalLink.url, iconUrl: externalLink.icon }));
}

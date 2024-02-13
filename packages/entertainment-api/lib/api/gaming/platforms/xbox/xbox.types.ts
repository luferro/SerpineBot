export enum Chart {
	TOP_SELLERS = 0,
	TOP_PLAYED = 1,
	UPCOMING_GAMES = 2,
}

export type Payload<T> = { [key: string]: T };

export type Profile = {
	xuid: string;
	gamertag: string;
	gamerScore: string;
	displayPicRaw: string | null;
	presentState: string;
	presenceText: string;
	preferredPlatforms: string[];
};

export type RecentlyPlayed = {
	titleId: string;
	name: string;
	displayImage: string;
	achievement: {
		currentAchievements: number;
		totalAchievements: number;
		currentGamerscore: number;
		totalGamerscore: number;
		progressPercentage: number;
	};
	titleHistory: { lastTimePlayed: string };
};

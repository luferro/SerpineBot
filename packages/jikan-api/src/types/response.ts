export interface JikanResponse {
	data: {
		mal_id: number;
		title: string;
		title_english: string | null;
		url: string;
		season: string;
		year: number;
		broadcast: {
			day: string | null;
			time: string | null;
			timezone: string | null;
			string: string | null;
		};
		status: string;
		score: number;
		episodes: number;
		duration: string;
		images: {
			jpg: {
				large_image_url: string | null;
			};
		};
		trailer: {
			url: string | null;
		};
	};
}

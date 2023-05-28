export interface RedditPayload<T> {
	data: T;
}

export interface RedditChildren<T> {
	children: T;
}

export interface RedditPost {
	data: {
		title: string;
		selftext: string | null;
		url: string;
		permalink: string;
		secure_media?: {
			type: string;
		};
		gallery_data?: {
			items: { media_id: string }[];
		};
		preview?: {
			reddit_video_preview?: {
				fallback_url: string;
			};
		};
		is_self: boolean;
		crosspost_parent: boolean | null;
		stickied: boolean;
		is_video: boolean;
		removed_by_category: boolean | null;
		created_utc: number;
	};
}

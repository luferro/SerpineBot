export interface Gallery {
	media_id: string;
}

export interface Children {
	data: {
		title: string;
		selftext: string | null;
		url: string;
		permalink: string;
		secure_media?: {
			type: string;
		};
		gallery_data?: {
			items: Gallery[];
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

export interface RedditPost {
	data: {
		children: Children[];
	};
}

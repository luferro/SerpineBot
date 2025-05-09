export type Posts = {
	data: {
		children: {
			data: {
				id: string;
				title: string;
				selftext: string | null;
				url: string;
				permalink: string;
				thumbnail: string;
				secure_media?: {
					type?: string;
					oembed?: {
						title: string;
						html: string;
						thumbnail_url: string;
						author_url: string;
					};
					reddit_video?: {
						fallback_url: string;
					};
				};
				is_gallery: boolean;
				gallery_data?: { items: { media_id: string }[] };
				is_self: boolean;
				crosspost_parent: boolean | null;
				stickied: boolean;
				is_video: boolean;
				removed_by_category: boolean | null;
				created_utc: number;
				over_18: boolean;
			};
		}[];
	};
};

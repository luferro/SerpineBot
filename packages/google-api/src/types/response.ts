interface Snippet {
	snippet: {
		channelId: string;
	};
}

export interface VideoResponse {
	items: Snippet[];
}

interface ChannelStatistics {
	statistics: {
		subscriberCount: string;
	};
}

export interface ChannelResponse {
	items?: ChannelStatistics[];
}

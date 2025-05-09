export type Result = {
	id: number;
	name: string;
	slug: string;
};

export type Event = {
	checksum: string;
	name: string;
	description?: string;
	live_stream_url?: string;
	event_logo?: { url: string };
	event_networks?: { url: string }[];
	start_time: number;
	end_time?: number;
};

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
	event_networks?: { id: number; url: string; network_type: { id: number; name: string } }[];
	start_time: number;
	end_time?: number;
	time_zone: string;
};

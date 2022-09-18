export interface NewsResponse<T> {
	results: T[];
}

export interface Article {
	source_id: string;
	title: string;
	link: string;
	description: string;
	content: string;
	image_url: string;
	pubDate: string;
}

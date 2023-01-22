export interface NewsResponse<T> {
	totalArticles: number;
	articles: T[];
}

export interface Article {
	title: string;
	description: string;
	content: string;
	url: string;
	image: string;
	publishedAt: string;
	source: {
		name: string;
		url: string;
	};
}

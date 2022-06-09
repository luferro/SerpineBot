type HttpMethods = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

export interface Request {
	url: string | URL;
	method?: HttpMethods;
	body?: string | URLSearchParams;
}

import { HttpMethod } from './enums';

export interface Request {
	url: string | URL;
	method?: HttpMethod;
	body?: string | URLSearchParams;
}

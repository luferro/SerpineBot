import axios from 'axios';
import { HeaderGenerator, Headers } from 'header-generator';

import { FetchError } from '../errors/FetchError';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
type Request = { url: string | URL; method?: HttpMethod; clientId?: string; authorization?: string; body?: string };

const isBodyJson = ({ body }: Required<Pick<Request, 'body'>>) => {
	try {
		JSON.parse(body);
		return true;
	} catch (error) {
		return false;
	}
};

export const getHeaders = ({ method, body, clientId, authorization }: Omit<Request, 'url'>) => {
	const headers = new Map();
	if (clientId) headers.set('Client-ID', clientId);
	if (authorization) headers.set('Authorization', `Bearer ${authorization}`);
	if (body && (method === 'POST' || method === 'PUT')) {
		headers.set('Content-Type', isBodyJson({ body }) ? 'application/json' : 'plain/text');
	}

	return new HeaderGenerator().getHeaders({}, Object.fromEntries(headers));
};

const getBody = ({ body }: Required<Pick<Request, 'body'>>) => (isBodyJson({ body }) ? JSON.parse(body) : body);

export const fetch = async <T>({ method = 'GET', url, clientId, authorization, body }: Request) => {
	try {
		const res = await axios(url.toString(), {
			method,
			headers: getHeaders({ method, clientId, authorization }),
			data: body ? getBody({ body }) : undefined,
		});
		if (res.status >= 400) throw new Error(`${res.status} ${res.statusText}`);

		const headers = res.headers as Headers;
		const payload = res.data as T;

		return { headers, payload };
	} catch (error) {
		throw new FetchError(`**${method}** request to **${url}** failed. Reason: ${(error as Error).message}`);
	}
};

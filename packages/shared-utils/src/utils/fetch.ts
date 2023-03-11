import { HeaderGenerator } from 'header-generator';
import undici from 'undici';

import { FetchError } from '../errors/FetchError';
import type { HttpMethod } from '../types/fetch';

interface Request {
	url: string | URL;
	method?: HttpMethod;
	body?: string | URLSearchParams;
}

const generateHeaders = () => {
	return new HeaderGenerator({ browserListQuery: 'last 5 versions' }).getHeaders();
};

export const fetch = async <T>({ method = 'GET', url, body }: Request): Promise<T> => {
	try {
		const res = await undici.fetch(url, {
			method,
			headers: {
				...generateHeaders(),
				'content-type':
					body instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json',
			},
			body: body ?? null,
		});

		if (!res.ok) {
			throw new Error(`${res.status} ${res.statusText}`);
		}

		const data = res.headers.get('content-type')?.includes('application/json')
			? await res.json()
			: await res.text();

		return data as unknown as Promise<T>;
	} catch (error) {
		const { message } = error as Error;
		throw new FetchError(`**${method}** request to **${url}** failed. **${message}**.`);
	}
};

export const fetchRedirectLocation = async ({ method = 'GET', url }: Pick<Request, 'url' | 'method'>) => {
	const res = await undici.request(url, { method, headers: generateHeaders() });
	res.body.dump();
	return res.headers['location']?.toString() ?? null;
};

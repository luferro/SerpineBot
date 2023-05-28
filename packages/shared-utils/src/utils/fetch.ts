import { HeaderGenerator } from 'header-generator';
import undici from 'undici';

import { FetchError } from '../errors/FetchError';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
type Request = { url: string | URL; method?: HttpMethod; body?: string | URLSearchParams };

const generateHeaders = ({ body }: Pick<Request, 'body'>) => {
	const headers = new HeaderGenerator({ browserListQuery: 'last 5 versions' }).getHeaders();

	if (body) {
		return {
			...headers,
			'content-type': body instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json',
		};
	}

	return headers;
};

export const fetch = async <T>({ method = 'GET', url, body }: Request) => {
	try {
		const res = await undici.fetch(url, {
			method,
			headers: generateHeaders({ body }),
			body: body ?? null,
		});
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

		const data = res.headers.get('content-type')?.includes('application/json')
			? await res.json()
			: await res.text();

		return data as unknown as Promise<T>;
	} catch (error) {
		const { message } = error as Error;
		throw new FetchError(`**${method}** request to **${url}** failed. Reason: **${message}**.`);
	}
};

export const fetchRedirectLocation = async ({ method = 'GET', url }: Omit<Request, 'body'>) => {
	const res = await undici.request(url, { method, headers: generateHeaders({}) });
	await res.body.dump();
	return res.headers['location']?.toString() ?? null;
};

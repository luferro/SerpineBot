import { HeaderGenerator } from 'header-generator';
import undici from 'undici';

import { FetchError } from '../errors/FetchError';
import { logger } from './logger';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
type Request = { url: string | URL; method?: HttpMethod; body?: string };

const generateHeaders = () => new HeaderGenerator({ browserListQuery: 'last 5 versions' }).getHeaders();

export const fetch = async <T>({ method = 'GET', url, body }: Request) => {
	const generatedHeaders = generateHeaders();
	const headers = body ? { ...generatedHeaders, 'content-type': 'application/json' } : generatedHeaders;

	try {
		const res = await undici.fetch(url, { method, headers, body });
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

		const data = res.headers.get('content-type')?.includes('application/json')
			? await res.json()
			: await res.text();

		return data as Promise<T>;
	} catch (error) {
		logger.debug(error);
		throw new FetchError(`**${method}** request to **${url}** failed.`);
	}
};

export const getRedirectLocation = async ({ url }: Omit<Request, 'body'>) => {
	const res = await undici.request(url, { headers: generateHeaders(), method: 'GET' });
	await res.body.dump();
	return res.headers['location']?.toString() ?? null;
};

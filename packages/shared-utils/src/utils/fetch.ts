import undici from 'undici';

import { FetchError } from '../errors/FetchError';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
type Request = { url: string | URL; method?: HttpMethod; body?: string };

export const fetch = async <T>({ method = 'GET', url, body }: Request) => {
	const headers = body ? { 'content-type': 'application/json' } : null;
	try {
		const res = await undici.request(url, { headers, method, body });
		if (res.statusCode >= 400) {
			await res.body.dump();
			throw new Error(`Status code ${res.statusCode}`);
		}

		const payload: T = res.headers['content-type']?.includes('application/json')
			? await res.body.json()
			: await res.body.text();

		return { headers: res.headers, payload };
	} catch (error) {
		throw new FetchError(`**${method}** request to **${url}** failed. Reason: ${(error as Error).message}`);
	}
};

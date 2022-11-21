import type { HttpMethod } from '../types/fetch';
import { fetch as _fetch } from 'undici';
import UserAgent from 'user-agents';
import { FetchError } from '../errors/FetchError';

interface Request {
	url: string | URL;
	method?: HttpMethod;
	body?: string | URLSearchParams;
}

export const fetch = async <T>({ method = 'GET', url, body }: Request): Promise<T> => {
	try {
		const res = await _fetch(url, {
			method,
			headers: {
				'User-Agent': new UserAgent().toString(),
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
		throw new FetchError(`**${method}** request to **${url}** failed. Reason: **${(error as Error).message}**.`);
	}
};

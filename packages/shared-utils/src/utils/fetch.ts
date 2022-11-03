import type { HttpMethod } from '../types/fetch';
import { request } from 'undici';
import UserAgent from 'user-agents';
import { FetchError } from '../errors/FetchError';

interface Request {
	url: string | URL;
	method?: HttpMethod;
	body?: string | URLSearchParams;
}

export const fetch = async <T>({ method = 'GET', url, body }: Request): Promise<T> => {
	try {
		const res = await request(url, {
			method,
			headers: {
				'User-Agent': new UserAgent().toString(),
				'content-type':
					body instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json',
			},
			body: body?.toString() ?? null,
		});

		if (res.statusCode >= 400) {
			await res.body.dump();
			throw new Error(res.statusCode.toString());
		}

		return res.headers['content-type']?.includes('application/json')
			? await res.body.json()
			: await res.body.text();
	} catch (error) {
		throw new FetchError(`**${method}** request to **${url}** failed. Reason: **${(error as Error).message}**.`);
	}
};

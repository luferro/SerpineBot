import { request } from 'undici';
import UserAgent from 'user-agents';
import { FetchError } from '../errors/fetchError';
import { Request } from '../types/request';

export const fetch = async <T>({ method = 'GET', url, body }: Request): Promise<T> => {
	const res = await request(url, {
		method,
		headers: {
			'User-Agent': new UserAgent().toString(),
			'content-type': body instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json',
		},
		body: body?.toString(),
	});

	if (res.statusCode >= 400) {
		await res.body.dump();
		throw new FetchError(`_*${method}*_ request to _*${url}*_ failed. Status code: _*${res.statusCode}*_.`);
	}

	return res.headers['content-type']?.includes('application/json') ? await res.body.json() : await res.body.text();
};

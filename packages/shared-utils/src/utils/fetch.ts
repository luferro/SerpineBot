import type { HttpMethod } from '../types/fetch';
import { Agent, request, setGlobalDispatcher } from 'undici';
import UserAgent from 'user-agents';

interface Request {
	url: string | URL;
	method?: HttpMethod;
	body?: string | URLSearchParams;
}

setGlobalDispatcher(
	new Agent({
		connect: { timeout: 60_000 },
		headersTimeout: 60_000,
		bodyTimeout: 60_000,
	}),
);

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
		throw new Error(`**${method}** request to **${url}** failed. Status code: **${res.statusCode}**.`);
	}

	return res.headers['content-type']?.includes('application/json') ? await res.body.json() : await res.body.text();
};

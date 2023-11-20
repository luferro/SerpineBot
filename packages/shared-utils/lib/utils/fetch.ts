import axios from 'axios';
import { HeaderGenerator, Headers } from 'header-generator';

import { FetchError } from '../errors/FetchError';

type Request = {
	url: string | URL;
	method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
	customHeaders?: Map<string, string>;
	body?: string;
	handleStatusCode?: (status: number) => Promise<unknown>;
};

const getHeaders = ({ customHeaders }: Required<Pick<Request, 'customHeaders'>>) => {
	if (!customHeaders.has('content-type')) customHeaders.set('content-type', 'application/json');
	return new HeaderGenerator().getHeaders({}, Object.fromEntries(customHeaders));
};

const getBody = ({ body }: Pick<Request, 'body'>) => {
	if (!body) return;
	try {
		return JSON.parse(body);
	} catch (error) {
		return body;
	}
};

export const fetch = async <T>({ method = 'GET', url, customHeaders = new Map(), body, handleStatusCode }: Request) => {
	try {
		const res = await axios(url.toString(), {
			method,
			headers: getHeaders({ customHeaders }),
			data: getBody({ body }),
			validateStatus: () => true,
		});
		const headers = res.headers as Headers;
		const payload = res.data as T;

		if (res.status >= 400) {
			const error = new FetchError(res.statusText)
				.setUrl(url.toString())
				.setStatus(res.status)
				.setHeaders(headers)
				.setPayload(payload);
			throw error;
		}

		return { headers, payload };
	} catch (error) {
		const isFetchError = error instanceof FetchError;
		if (isFetchError) {
			const status = error.status ?? 500;
			if (handleStatusCode) await handleStatusCode(status);
		} else (error as Error).message = `**${method}** request to **${url}** failed.`;
		throw error;
	}
};

import axios from "axios";
import { HeaderGenerator, Headers } from "header-generator";

import { FetchError } from "./errors/FetchError";

type Options = {
	/**
	 * Request methods
	 * @default "GET"
	 */
	method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
	/** Headers to attach to the request */
	headers?: Map<string, string>;
	/** Body to attach to the request */
	body?: string;
	/** Callback to modify the way FetchErrors are handled */
	cb?: (status: number) => Promise<unknown>;
};

export const fetch = async <T>(url: string, { method = "GET", headers, body, cb }: Options = {}) => {
	try {
		const res = await axios(url, {
			method,
			headers: getHeaders(headers),
			data: parseBody(body),
			validateStatus: () => true,
		});
		const responseHeaders = res.headers as Headers;
		const payload = res.data as T;

		if (res.status >= 400) {
			const error = new FetchError(res.statusText)
				.setUrl(url)
				.setStatus(res.status)
				.setHeaders(responseHeaders)
				.setPayload(payload);
			throw error;
		}

		return { headers: responseHeaders, payload };
	} catch (error) {
		if (error instanceof FetchError) await cb?.(error.status ?? 500);
		else (error as Error).message = `**${method}** request to **${url}** failed.`;
		throw error;
	}
};

const getHeaders = (headers = new Map<string, string>()) => {
	if (!headers.has("content-type")) headers.set("content-type", "application/json");
	return new HeaderGenerator().getHeaders({}, Object.fromEntries(headers));
};

const parseBody = (body?: string) => {
	if (!body) return;
	try {
		return JSON.parse(body);
	} catch (error) {
		return body;
	}
};

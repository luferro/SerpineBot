import axios from "axios";
import { HeaderGenerator, Headers } from "header-generator";

import { FetchError } from "./errors/FetchError";

type Options = {
	/**
	 * Url to make a request to
	 */
	url: string | URL;
	/**
	 * Request methods
	 * @default "GET"
	 */
	method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
	/**
	 * Headers to attach to the request
	 */
	customHeaders?: Map<string, string>;
	/**
	 * Body to attach to the request
	 */
	body?: string;
	/**
	 * Callback to modify the way FetchErrors are handled
	 */
	handleStatusCode?: (status: number) => Promise<unknown>;
};

const getHeaders = (customHeaders = new Map<string, string>()) => {
	if (!customHeaders.has("content-type")) customHeaders.set("content-type", "application/json");
	return new HeaderGenerator().getHeaders({}, Object.fromEntries(customHeaders));
};

const parseBody = (body?: string) => {
	if (!body) return;
	try {
		return JSON.parse(body);
	} catch (error) {
		return body;
	}
};

export const fetch = async <T>({ method = "GET", url, customHeaders, body, handleStatusCode }: Options) => {
	try {
		const res = await axios(url.toString(), {
			method,
			headers: getHeaders(customHeaders),
			data: parseBody(body),
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
		if (error instanceof FetchError) await handleStatusCode?.(error.status ?? 500);
		else (error as Error).message = `**${method}** request to **${url}** failed.`;
		throw error;
	}
};

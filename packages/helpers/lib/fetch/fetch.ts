import { HeaderGenerator } from "header-generator";
import { FetchError } from "./errors/FetchError.js";

type Options = {
	/**
	 * Request methods
	 * @default "GET"
	 */
	method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
	/** Headers to attach to the request */
	headers?: Map<string, string>;
	/** Body to attach to the request */
	body?: BodyInit;
	/** Callback to modify the way FetchErrors are handled */
	cb?: (status: number) => Promise<unknown>;
};

export const fetcher = async <T>(url: string, { method = "GET", cb, ...rest }: Options = {}) => {
	try {
		const res = await fetch(url, { method, headers: getHeaders(rest.headers), body: rest.body });
		const headers = res.headers as Headers;
		const isJson = headers.get("content-type")?.includes("application/json");
		const payload = (isJson ? await res.json() : await res.text()) as T;

		if (res.status >= 400) {
			throw new FetchError(res.statusText).setHeaders(headers).setUrl(url).setStatus(res.status).setPayload(payload);
		}

		return { headers, payload };
	} catch (error) {
		if (error instanceof FetchError) await cb?.(error.status ?? 500);
		else (error as Error).message = `${method} request to ${url} failed`;
		throw error;
	}
};

const getHeaders = (headers = new Map<string, string>()) => {
	if (!headers.has("content-type")) headers.set("content-type", "application/json");
	return new HeaderGenerator().getHeaders({}, Object.fromEntries(headers));
};

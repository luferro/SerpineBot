import { Headers } from "header-generator";

export class FetchError extends Error {
	url?: string;
	status?: number;
	headers?: Headers;
	payload?: unknown;

	setUrl(url: string) {
		this.url = url;
		return this;
	}

	setStatus(status: number) {
		this.status = status;
		return this;
	}

	setHeaders(headers: Headers) {
		this.headers = headers;
		return this;
	}

	setPayload(payload: unknown) {
		this.payload = payload;
		return this;
	}
}

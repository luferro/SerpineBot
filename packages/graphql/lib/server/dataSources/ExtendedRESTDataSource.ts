import { type CacheOptions, RESTDataSource, type RequestOptions } from "@apollo/datasource-rest";
import type { FetcherResponse } from "@apollo/utils.fetcher";
import { type Callback, getHeaders, getHtml, loadHtml, loadUrl } from "@luferro/scraper";

type CheerioAPI = ReturnType<typeof loadHtml>;

export abstract class ExtendedRESTDataSource extends RESTDataSource {
	protected getHeaders() {
		return getHeaders();
	}

	protected getHtml(path: string) {
		const url = this.resolveURL(path, { params: new URLSearchParams(), headers: {} });
		return getHtml(url.toString());
	}

	protected loadHtml(html: string) {
		return loadHtml(html);
	}

	protected async loadUrl<T = CheerioAPI>(path: string): Promise<T>;
	protected async loadUrl<T = unknown>(path: string, cb: Callback<T>): Promise<T>;
	protected async loadUrl<T = unknown | CheerioAPI>(path: string, cb?: Callback<T>): Promise<T> {
		const url = this.resolveURL(path, { params: new URLSearchParams(), headers: {} });
		if (!cb) return await loadUrl(url.toString());
		return await loadUrl(url.toString(), cb);
	}

	protected onUnauthorized?(): Promise<void>;
	protected onForbidden?(): Promise<void>;
	protected onNotFound?(): Promise<void>;
	protected onRateLimit?(): Promise<void>;
	protected onError?(): Promise<void>;

	protected override async throwIfResponseIsError(options: {
		url: URL;
		request: RequestOptions<CacheOptions>;
		response: FetcherResponse;
		parsedBody: unknown;
	}) {
		if (options.response.ok) return;

		switch (options.response.status) {
			case 401:
				await this.onUnauthorized?.();
				break;
			case 403:
				await this.onForbidden?.();
				break;
			case 404:
				await this.onNotFound?.();
				break;
			case 429:
				await this.onRateLimit?.();
				break;
			default:
				await this.onError?.();
				break;
		}

		throw await this.errorFromResponse(options);
	}
}

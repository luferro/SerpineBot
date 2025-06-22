import type { FieldPolicy } from "@apollo/client";

export function withTTL<T = unknown>(ttl = 10 * 60 * 1000): FieldPolicy<{ __ttl: number; data: T }, T> {
	return {
		read(existing) {
			if (!existing || Date.now() - existing.__ttl > ttl) return undefined;
			return existing.data;
		},
		merge(_existing, incoming: T) {
			return { __ttl: Date.now(), data: incoming };
		},
	};
}

export function skipCache<T = unknown>(): FieldPolicy<T, T> {
	return {
		read() {
			return undefined;
		},
		merge(_existing, incoming) {
			return incoming;
		},
	};
}

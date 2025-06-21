import crypto from "node:crypto";
import KeyvRedis from "@keyv/redis";
import Keyv, { type StoredDataNoRaw } from "keyv";

export class RedisStore<T> extends KeyvRedis<T> {}

export class Cache<T> extends Keyv<T> {
	// biome-ignore lint/suspicious/noExplicitAny: same behaviour as keyv get
	async getOrRefresh<T = any>(key: string, cb: () => Promise<void>): Promise<StoredDataNoRaw<T>> {
		let value = await this.get<T>(key);
		if (!value) {
			await cb();
			value = await this.get<T>(key);
		}
		return value;
	}

	async checkAndMarkSent(key: string, ttl = 60 * 60 * 24 * 30 * 1000) {
		const exists = await this.get(key);
		if (exists) return true;

		await this.set(key, "1", ttl);
		return false;
	}
}

export function createHash(data: crypto.BinaryLike) {
	return crypto.createHash("sha256").update(data).digest("hex");
}

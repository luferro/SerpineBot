import crypto from "node:crypto";
import KeyvRedis from "@keyv/redis";
import Keyv, { type StoredDataNoRaw } from "keyv";

export class RedisStore extends KeyvRedis {}

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
}

export function createHash(data: crypto.BinaryLike) {
	return crypto.createHash("sha256").update(data).digest("hex");
}

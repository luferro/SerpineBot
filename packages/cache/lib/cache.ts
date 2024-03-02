import crypto from "node:crypto";
import { Redis, type RedisKey } from "ioredis";

export class Cache {
	private client: Redis;
	private expirySeconds = 60 * 60 * 24 * 30;

	constructor(uri: string) {
		this.client = new Redis(uri);
	}

	withExpirySeconds(expirySeconds: number) {
		this.expirySeconds = expirySeconds;
		return this;
	}

	hash(data: crypto.BinaryLike) {
		return crypto.createHash("sha256").update(data).digest("hex");
	}

	async some(...args: RedisKey[]) {
		const count = await this.client.exists(args);
		return count > 0;
	}

	async every(...args: RedisKey[]) {
		const count = await this.client.exists(args);
		return count === args.length;
	}

	async get(key: RedisKey) {
		return this.client.get(key);
	}

	async set(key: RedisKey, value: string | number | Buffer) {
		return this.client.set(key, JSON.stringify(value), "EX", this.expirySeconds);
	}

	async mset(records: Map<RedisKey, string | number | Buffer>) {
		const pipeline = this.client.pipeline();
		pipeline.mset(records);
		for (const key of records.keys()) {
			pipeline.expire(key, this.expirySeconds);
		}

		return pipeline.exec();
	}

	async quit() {
		return this.client.quit();
	}
}

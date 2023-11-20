import { getExtendedRedisClient } from '@luferro/database';
import crypto from 'crypto';
import NodeCache from 'node-cache';

import { Memory, Persistent } from '../types/cache';

export class Cache {
	memory: Memory;
	persistent: Persistent;

	constructor() {
		this.memory = { anime: new NodeCache() };
		this.persistent = getExtendedRedisClient();
	}

	createHash(data: crypto.BinaryLike) {
		return crypto.createHash('sha256').update(data).digest('hex');
	}
}

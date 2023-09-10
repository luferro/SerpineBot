import crypto, { BinaryLike } from 'crypto';

export const createHash = (data: BinaryLike) => crypto.createHash('sha256').update(data).digest('hex');

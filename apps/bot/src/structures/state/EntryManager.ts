import { StateEntry, StateModel } from '@luferro/database';

export type EntryManagerArgs = { job: string; category?: string; data: StateEntry };

export class EntryManager {
	private job: string;
	private category: string;
	private data: StateEntry;

	constructor({ job, category, data }: EntryManagerArgs) {
		this.job = job;
		this.category = category ?? 'default';
		this.data = data;
	}

	async update() {
		const state = await StateModel.getStateByJob(this.job);
		const entries = state?.entries.get(this.category) ?? [];

		const isDuplicate = entries.some((entry) => entry.title === this.data.title || entry.url === this.data.url);
		if (isDuplicate) return false;

		await StateModel.createOrUpdateState(this.job, this.category, entries.concat(this.data));
		return true;
	}
}

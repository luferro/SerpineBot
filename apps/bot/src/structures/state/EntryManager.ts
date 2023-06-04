import { StateEntry, StateModel } from '@luferro/database';
import { SleepUtil } from '@luferro/shared-utils';

export type EntryManagerArgs = { job: string; data: StateEntry };

export class EntryManager {
	private job: string;
	private data: StateEntry;

	constructor({ job, data }: EntryManagerArgs) {
		this.job = job;
		this.data = data;
	}

	async update() {
		await SleepUtil.sleep(5000);
		const state = await StateModel.getStateByJob(this.job);
		const entries = state?.entries ?? [];

		const isDuplicate = entries.some((entry) => entry.title === this.data.title || entry.url === this.data.url);
		if (isDuplicate) return false;

		await StateModel.createOrUpdateState(this.job, entries.concat(this.data));
		return true;
	}
}

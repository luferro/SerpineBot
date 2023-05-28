import { EntryManager, EntryManagerArgs } from './EntryManager';

export class State {
	entry(args: EntryManagerArgs) {
		return new EntryManager(args);
	}
}

export type AlertType = 'SALE' | 'RELEASED' | 'SUBSCRIPTION.ADDED' | 'SUBSCRIPTION.REMOVED';

export interface Alert {
	name: string;
	url: string;
	discount: number | null;
	regular: string | null;
	discounted: string | null;
	addedTo: string[];
	removedFrom: string[];
}

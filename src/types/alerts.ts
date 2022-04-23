export interface Alert {
	name: string;
	url: string;
	discount: number | null;
	regular: string | null;
	discounted: string | null;
	addedTo: string[];
	removedFrom: string[];
}

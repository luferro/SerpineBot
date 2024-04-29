export type Option = {
	type: number;
	name: string;
	description: string;
	required: boolean;
	choices?: { name: string }[];
};

export type Subcommand = {
	type: number;
	name: string;
	description: string;
	required: boolean;
	options: Option[];
};

export type Group = {
	type: number;
	name: string;
	description: string;
	required: boolean;
	subcommands: Subcommand[];
	options: Option[];
};

export type Command = {
	id: string;
	name: string;
	description: string;
	groups: Group[];
	subcommands: Subcommand[];
	options: Option[];
};

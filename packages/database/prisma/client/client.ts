import { PrismaClient } from "@prisma/client";

import { extension } from "./extension";

type Options = {
	/**
	 * MongoDB URI
	 */
	uri: string;
};

export type ExtendedDatabaseClient = ReturnType<DatabaseClient["withExtensions"]>;

export class DatabaseClient extends PrismaClient {
	constructor({ uri }: Options) {
		super({ datasources: { db: { url: uri } } });
	}

	withExtensions() {
		return this.$extends(extension);
	}
}

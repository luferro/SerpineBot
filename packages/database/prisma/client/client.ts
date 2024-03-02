import { PrismaClient } from "@prisma/client";

import { extension } from "./extension";

export type ExtendedDatabaseClient = ReturnType<DatabaseClient["withExtensions"]>;

export class DatabaseClient extends PrismaClient {
	constructor(uri: string) {
		super({ datasources: { db: { url: uri } } });
	}

	withExtensions() {
		return this.$extends(extension);
	}
}

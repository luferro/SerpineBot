import type { GraphQLRequest } from "@apollo/server";
import { createHash } from "@luferro/cache";
import { type DocumentNode, type ExecutionResult, print } from "graphql";
import { ExtendedRESTDataSource } from "./ExtendedRESTDataSource.js";

export abstract class GraphQLDataSource extends ExtendedRESTDataSource {
	// biome-ignore lint/suspicious/noExplicitAny: default to any if no type is provided
	async query<T = any>(operation: DocumentNode, options: Omit<GraphQLRequest, "query"> = {}) {
		const body = {
			query: print(operation),
			variables: options.variables,
			operationName: options.operationName,
		};

		const response = await this.post<ExecutionResult<T>>("/", {
			cacheKey: createHash(JSON.stringify(body)),
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body,
		});

		return response.data;
	}
}

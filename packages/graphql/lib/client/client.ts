import {
	ApolloClient,
	type ApolloClientOptions,
	ApolloError,
	type ApolloQueryResult,
	type DocumentNode,
	type NormalizedCacheObject,
	type OperationVariables,
} from "@apollo/client/core/core.cjs";

type Context = {
	headers: Record<string, string>;
};

export class GraphQLClient extends ApolloClient<NormalizedCacheObject> {
	protected contexts: Record<string, Context> = {};

	constructor(options: ApolloClientOptions<NormalizedCacheObject>) {
		super(options);
		this.setServiceContext();
	}

	protected createServicesContext?(): Record<string, string>;

	protected getServiceContext(serviceName: string): Context | undefined {
		return this.contexts[serviceName];
	}

	protected setServiceContext() {
		const contexts = this.createServicesContext?.() ?? {};
		for (const [key, value] of Object.entries(contexts)) {
			this.contexts[key] = { headers: { Authorization: value } };
		}
	}

	protected createQueryMethod<TOperation, TVariables extends OperationVariables, TData>(
		serviceName: string,
		query: DocumentNode,
		transform: (data: TOperation) => TData,
	) {
		const context = this.getServiceContext(serviceName);
		return async (variables?: TVariables) => {
			const data = await this.executeQuery<TOperation>(serviceName, () =>
				this.query<TOperation, TVariables>({ query, variables, context }),
			);
			return transform(data);
		};
	}

	private async executeQuery<T>(serviceName: string, operation: () => Promise<ApolloQueryResult<T>>): Promise<T> {
		try {
			const { data, errors } = await operation();

			if (errors?.length) {
				throw new Error(`GraphQL errors in ${serviceName} operation: ${errors.map((e) => e.message).join(", ")}`);
			}

			return data;
		} catch (error) {
			if (error instanceof ApolloError) throw new Error(`Apollo error in ${serviceName} operation: ${error.message}`);
			throw error;
		}
	}
}

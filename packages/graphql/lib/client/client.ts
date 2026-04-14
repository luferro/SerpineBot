import { ApolloClient, type DocumentNode, type OperationVariables } from "@apollo/client/core";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

export class GraphQLClient extends ApolloClient {
	protected contexts: Record<string, { headers: Record<string, string> }> = {};

	constructor(options: ApolloClient.Options) {
		super(options);
		this.setServiceContext();
	}

	protected createServicesContext?(): Record<string, string>;

	protected getServiceContext(serviceName: string) {
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
				this.query<TOperation, TVariables>({
					query,
					context,
					...(variables !== undefined && { variables }),
				} as ApolloClient.QueryOptions<TOperation, TVariables>),
			);
			return transform(data);
		};
	}

	private async executeQuery<T>(
		serviceName: string,
		operation: () => Promise<ApolloClient.QueryResult<T>>,
	): Promise<T> {
		try {
			const { data, error } = await operation();

			if (error) {
				throw new Error(`GraphQL error in ${serviceName} operation: ${error.message}`);
			}

			if (!data) {
				throw new Error(`No data returned for ${serviceName} operation`);
			}

			return data as T;
		} catch (error) {
			if (error instanceof CombinedGraphQLErrors)
				throw new Error(`Apollo error in ${serviceName} operation: ${error.message}`);
			throw error;
		}
	}
}

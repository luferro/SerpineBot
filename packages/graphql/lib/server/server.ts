import {
	ApolloServer,
	type ApolloServerOptions,
	type ApolloServerOptionsWithStaticSchema,
	type BaseContext,
} from "@apollo/server";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { toArray } from "@luferro/utils/data";
import { resolvers as scalarResolvers, typeDefs as scalarTypeDefs } from "graphql-scalars";

function withScalars<TContext extends BaseContext>(options: ApolloServerOptionsWithStaticSchema<TContext>) {
	const typeDefs = mergeTypeDefs([...scalarTypeDefs, ...(options.typeDefs ? toArray(options.typeDefs) : [])]);
	const resolvers = mergeResolvers([scalarResolvers, ...(options.resolvers ? toArray(options.resolvers) : [])]);

	return {
		...options,
		typeDefs,
		resolvers,
	} as ApolloServerOptionsWithStaticSchema<TContext>;
}

export class GraphQLServer<in out TContext extends BaseContext = BaseContext> extends ApolloServer<TContext> {
	constructor(options: ApolloServerOptions<TContext>) {
		super(options.gateway ? options : withScalars(options));
	}
}

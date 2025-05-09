import path from "node:path";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import fastifyApollo, { fastifyApolloDrainPlugin, fastifyApolloHandler } from "@as-integrations/fastify";
import { loadFiles } from "@graphql-tools/load-files";
import { GraphQLServer } from "@luferro/graphql/server";
import fastify from "fastify";
import { cache } from "./cache.js";
import { type Context, getContext } from "./context.js";

type Keyv = NonNullable<ConstructorParameters<typeof KeyvAdapter<string>>[0]>;

const app = fastify({ logger: true });

const apollo = new GraphQLServer<Context>({
	typeDefs: await loadFiles(path.join(import.meta.dirname, "/apis/**/schema.graphql")),
	resolvers: await loadFiles(path.join(import.meta.dirname, "/apis/**/resolver.js")),
	cache: new KeyvAdapter(cache as unknown as Keyv),
	plugins: [fastifyApolloDrainPlugin(app)],
});
await apollo.start();

app.register(fastifyApollo(apollo));

app.get("/api/health", (_req, res) => res.status(200).send({ ok: true }));
app.route({
	url: "/api/graphql",
	method: ["GET", "POST"],
	handler: fastifyApolloHandler(apollo, { context: async (req) => getContext(req) }),
});

app.listen({ host: "0.0.0.0", port: 4000 });

function shutdown() {
	app.close();
	process.exit(1);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

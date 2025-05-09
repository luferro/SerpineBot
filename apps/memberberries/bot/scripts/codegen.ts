import { generate } from "@graphql-codegen/cli";
import { loadConfig } from "@luferro/config";

const config = loadConfig();

await generate({
	schema: config.get("services.graphql.uri"),
	documents: ["src/**/*.ts"],
	ignoreNoDocuments: true,
	emitLegacyCommonJSImports: false,
	generates: {
		"./src/graphql/__generated__/": {
			preset: "client",
			config: {
				documentMode: "documentNode",
				useTypeImports: true,
			},
			presetConfig: {
				gqlTagName: "gql",
			},
		},
	},
});

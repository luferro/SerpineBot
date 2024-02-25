import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	generates: {
		"lib/anime/__generated__/": {
			schema: "https://graphql.anilist.co/graphql",
			documents: ["lib/anime/**/*.ts"],
			preset: "client",
			config: { avoidOptionals: true, useTypeImports: true },
		},
	},
};

export default config;

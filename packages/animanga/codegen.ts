import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	emitLegacyCommonJSImports: false,
	generates: {
		"lib/anilist/__generated__/": {
			schema: "https://graphql.anilist.co/graphql",
			documents: ["lib/anilist/**/*.ts"],
			preset: "client",
			config: { useTypeImports: true },
		},
	},
};

export default config;

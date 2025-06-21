import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: `${process.env.SB_SERVICES__POSTGRES__URI}/${process.env.SB_CLIENT__MEMBERBERRIES__DATABASE}`,
	},
});

import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: process.env.SB_SERVICES__POSTGRES__URI?.concat("/memberberries") ?? "",
	},
});

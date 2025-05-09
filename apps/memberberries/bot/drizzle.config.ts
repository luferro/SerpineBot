import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: "postgresql://luferro:serpinebot@localhost:5432/memberberries",
	},
});

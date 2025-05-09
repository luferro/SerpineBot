import { loadConfig } from "@luferro/config";
import { defineConfig } from "drizzle-kit";

const config = loadConfig();

export default defineConfig({
	out: "./drizzle",
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: config.get("services.postgres.uri").concat("/memberberries"),
	},
});

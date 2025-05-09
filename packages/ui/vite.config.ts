import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { glob } from "glob";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
	optimizeDeps: {
		include: ["@mantine/core", "@mantine/carousel", "@mantine/dates", "@mantine/spotlight"],
	},
	resolve: {
		alias: {
			"~": path.resolve(import.meta.dirname, "./lib"),
		},
	},
	plugins: [
		react(),
		libInjectCss(),
		dts({ include: ["lib"] }),
		{
			name: "copy-styles",
			closeBundle() {
				fs.copyFileSync(
					path.resolve(import.meta.dirname, "lib/styles.css"),
					path.resolve(import.meta.dirname, "dist/styles.css"),
				);
			},
		},
	],
	build: {
		lib: {
			entry: path.resolve(import.meta.dirname, "lib/index.ts"),
			name: "ui",
			formats: ["es"],
			fileName: (format) => `ui.${format}.js`,
		},
		rollupOptions: {
			plugins: [preserveDirectives()],
			external: [
				"react",
				"react/jsx-runtime",
				"@mantine/core",
				"@mantine/hooks",
				"@mantine/carousel",
				"@mantine/dates",
				"@mantine/spotlight",
				"@tabler/icons-react",
			],
			input: Object.fromEntries(
				glob
					.sync("lib/**/*.{ts,tsx}", { ignore: ["lib/**/*.d.ts"] })
					.map((file) => [
						path.relative("lib", file.slice(0, file.length - path.extname(file).length)),
						fileURLToPath(new URL(file, import.meta.url)),
					]),
			),
			output: {
				assetFileNames: "assets/[name][extname]",
				entryFileNames: "[name].js",
				inlineDynamicImports: false,
			},
		},
	},
});

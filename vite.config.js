// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			// eslint-disable-next-line no-undef
			entry: resolve(__dirname, "src/index.ts"),
			name: "dom",
			formats: ["es", "umd"],
			fileName: format => `dom.${format}.js`,
		},
		sourcemap: true,
		minify: false,
		target: "es2022",
	},
	test: {
		coverage: {
			reporter: ["text"],
		},
		browser: {
			provider: "playwright",
			enabled: true,
			name: "chromium",
		},
	},
	plugins: [
		dts({
			// eslint-disable-next-line no-undef
			outDir: resolve(__dirname, "dist/types"),
		}),
	],
});

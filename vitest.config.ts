import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		browser: {
			provider: "playwright",
			enabled: true,
			instances: [{ browser: "chromium", headless: true }],
			viewport: {
				width: 1000,
				height: 1000,
			}
		},
		globals: true,
		coverage: {
			reporter: ["text", "json", "html"],
			provider: "v8",
			include: ["src/**/*.ts"],
			exclude: ["src/index.ts"],
		},
	},
});

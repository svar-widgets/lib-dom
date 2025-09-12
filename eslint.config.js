import eslintConfigPrettier from "eslint-config-prettier";
import tsLint from "typescript-eslint";
import jsLint from "@eslint/js";
import globals from "globals";

export default [
	{ files: ["**/*.{js,ts}"] },
	jsLint.configs.recommended,

	{
		plugins: {
			"@typescript-eslint": tsLint.plugin,
		},
		languageOptions: {
			parser: "@typescript-eslint/parser",
			globals: { ...globals.browser, ...globals.es2022, setTimeout: true },
			ecmaVersion: 2022,
			sourceType: "module",
			parserOptions: {
				warnOnUnsupportedTypeScriptVersion: false,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...tsLint.configs.recommended,
	{
		rules: {
			"no-bitwise": ["error"],
			// Ignore unused vars starting with _
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_" },
			],
			// Turn off the need for explicit function return types
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "warn",
			// Warn when "any" type is used
			"@typescript-eslint/no-explicit-any": "warn",
			// Warn on @ts-ignore comments
			"@typescript-eslint/ban-ts-comment": "warn",
		},
	},
	{
		ignores: ["node_modules/", "dist/"],
	},
	eslintConfigPrettier,
];

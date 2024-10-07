import eslintConfigPrettier from "eslint-config-prettier";
import jsLint from "@eslint/js";
import globals from "globals";

export default [
	{ files: ["**/*.{js,ts}"] },
	jsLint.configs.recommended,

	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.es2022, setTimeout: true },
			ecmaVersion: 2022,
			sourceType: "module",
		},
	},
	{
		rules: {
			"no-bitwise": ["error"],
		},
	},
	{
		ignores: ["node_modules/", "dist/"],
	},
	eslintConfigPrettier,
];

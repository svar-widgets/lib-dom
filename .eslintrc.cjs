module.exports = {
	parser: "@typescript-eslint/parser",
	env: {
		browser: true,
		es2022: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
		tsconfigRootDir: __dirname,
		extraFileExtensions: [],
	},
	plugins: ["@typescript-eslint"],
	rules: {
		"no-bitwise": ["error"],
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off",
	},
};

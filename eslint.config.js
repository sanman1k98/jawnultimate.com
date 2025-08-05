import antfu from '@antfu/eslint-config';

export default antfu({
	typescript: true,
	stylistic: {
		indent: 'tab',
		semi: true,
		quotes: 'single',
		overrides: {
			'style/brace-style': [
				'error',
				'1tbs',
				{ allowSingleLine: true },
			],
			'style/newline-per-chained-call': [
				'error',
				{ ignoreChainWithDepth: 2 },
			],
		},
	},
	formatters: {
		astro: 'prettier',
		html: true,
		css: true,
		prettierOptions: {
			tailwindStylesheet: './src/styles/global.css',
			plugins: [
				'prettier-plugin-tailwindcss',
			],
		},
	},
	astro: true,
});

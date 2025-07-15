import antfu from '@antfu/eslint-config';

export default antfu({
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
	formatters: true,
	astro: true,
});

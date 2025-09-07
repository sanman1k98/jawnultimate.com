import antfu from '@antfu/eslint-config';

export default antfu({
	astro: true,
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
		},
	},
	formatters: {
		astro: 'prettier',
		html: true,
		css: true,
		prettierOptions: {
			// @ts-expect-error options for plugins not not typed
			astroAllowShorthand: true,
			tailwindStylesheet: './src/styles/tailwind.css',
			plugins: [
				'prettier-plugin-tailwindcss',
			],
		},
	},
});

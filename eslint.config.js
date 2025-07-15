import antfu from '@antfu/eslint-config';

export default antfu({
	stylistic: {
		indent: 'tab',
		semi: true,
	},
	formatters: true,
	astro: true,
});

/** @type {import("prettier").Config} */
export default {
	semi: true,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
	plugins: [
		'prettier-plugin-astro',
		'prettier-plugin-tailwindcss',
	],
	tailwindStylesheet: './src/styles/tailwind.css',
	overrides: [
		{
			files: ['.*', '*.md', '*.toml', '*.yml'],
			options: {
				useTabs: false,
			},
		},
		{
			files: ['**/*.astro'],
			options: {
				// Use ESLint to lint and format frontmatter.
				astroSkipFrontmatter: true,
				astroAllowShorthand: true,
				parser: 'astro',
			},
		},
	],
};

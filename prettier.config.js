// HACK: empty config file for `prettier-plugin-tailwindcss` to work.
//
// For some reason, the `prettier-plugin-tailwindcss` plugin will not work if
// when integrating Prettier with ESLint if there is no Prettier config file.
// It should be able to resolve the path to 'tailwindStylesheet' by using
// `process.cwd()` but instead of using the path to the Prettier config file,
// but it just silently fails and fallsback to the builtin CSS formatting.
//
// To be fair, they do recommend *not* to integrate linters with formatters and
// *not* to use linters for formatting, but I really like this ESLint preset.

export default {
	// Use ESLint to format.
};

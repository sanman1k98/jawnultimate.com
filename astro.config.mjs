import tailwindcss from '@tailwindcss/vite';

// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	vite: {
		server: {
			// Access dev server with local hostname when running `pnpm run dev --host`.
			allowedHosts: ['.local'],
		},
		plugins: [tailwindcss()],
	},
	experimental: {
		// The following will be the new defaults in Astro 6.
		preserveScriptOrder: true,
		headingIdCompat: true,
	},
});

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
		preserveScriptOrder: true, // default in Astro 6
		headingIdCompat: true, // default in Astro 6
		staticImportMetaEnv: true, // default in Astro 6
	},
});

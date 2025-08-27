import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [sitemap()],

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

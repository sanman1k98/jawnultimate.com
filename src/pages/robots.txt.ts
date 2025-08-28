/**
 * @file
 * Generate a basic `robots.txt` file and include our sitemap.
 *
 * @see {@link https://docs.astro.build/en/guides/integrations-guide/sitemap/#sitemap-link-in-robotstxt}
 */

import type { APIRoute } from 'astro';

function getRobotsTxt(sitemapURL: URL) {
	return `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;
}

export const GET: APIRoute = ({ site }) => {
	const sitemapURL = new URL('sitemap-index.xml', site);
	return new Response(getRobotsTxt(sitemapURL));
};

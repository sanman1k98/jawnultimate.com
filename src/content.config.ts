import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { RosterSchema } from './schemas/roster';

const rosters = defineCollection({
	loader: glob({
		pattern: '**/[^_]*.yaml',
		base: './src/rosters',
	}),
	schema: RosterSchema,
});

export const collections = { rosters };

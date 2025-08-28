import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { RosterSchema } from './schemas/roster';

const rosters = defineCollection({
	schema: RosterSchema,
	loader: glob({
		pattern: '**/[^_]*.yaml',
		base: './rosters',
	}),
});

export const collections = { rosters };

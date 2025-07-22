import { z } from 'astro/zod';

const PlayerSchema = z.object({
	name: z.string(),
	number: z.union([
		z.number().min(0).max(99).int(),
		z.string().regex(/^\d{2}$/), // Handles cases like "00".
	]),
	captain: z.literal(true).optional(),
});

export const RosterSchema = z.object({
	title: z.string(),
	players: PlayerSchema.array(),
})

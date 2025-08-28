import { z } from 'astro/zod';

/** Date only form "YYYY-MM". */
const rosterDateRegex = /^\d{4}-\d{2}/;

const RosterDateSchema = z.coerce.string().transform((arg, ctx) => {
	if (!rosterDateRegex.test(arg)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Must use form YYYY-MM',
		});
	}

	const date = new Date(arg);

	if (Number.isNaN(date.valueOf())) {
		ctx.addIssue({
			code: z.ZodIssueCode.invalid_date,
			message: 'Invalid date; must use form YYYY-MM',
		});
		return z.NEVER;
	} else {
		return date;
	}
});

const JerseyNumberSchema = z.union([
	z.number().min(0).max(99).int(),
	z.string().regex(/^\d{2}$/), // Handles cases like "00".
]);

const PlayerSchema = z.object({
	name: z.string(),
	number: JerseyNumberSchema,
	captain: z.boolean().optional(),
});

const PlayerListSchema = PlayerSchema.array().superRefine((players, ctx) => {
	const reverseLookup = new Map<number, string[]>();

	for (const { name, number } of players) {
		const key = Number(number);
		if (!reverseLookup.has(key))
			reverseLookup.set(key, [name]);
		else
			reverseLookup.get(key)!.push(name);
	}

	for (const [number, names] of reverseLookup.entries()) {
		if (names.length > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Duplicate jersey number: ${names.join(', ')} have the same jersey number ${number}`,
			});
		}
	}
});

export const RosterSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	date: RosterDateSchema,
	players: PlayerListSchema,
});

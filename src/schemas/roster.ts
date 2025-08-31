import { z } from 'astro/zod';

/** Date only form "YYYY-MM". */
const rosterDateRegex = /^\d{4}-\d{2}/;

const RosterDateSchema = z.coerce.string().transform((arg, ctx) => {
	if (!rosterDateRegex.test(arg)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Must use form YYYY-MM',
		});
		return z.NEVER;
	}

	const date = new Date(arg);
	if (Number.isNaN(date.valueOf())) {
		ctx.addIssue({
			code: z.ZodIssueCode.invalid_date,
			message: 'Must use form YYYY-MM',
		});
		return z.NEVER;
	}

	return date;
});

const DivisionSchema = z.enum(['mixed', 'open']);

const JerseyNumberSchema = z.union([
	z.number().min(0).max(99).int(),
	z.string().regex(/^\d{2}$/), // Handles cases like "00".
]);

const PlayerSchema = z.object({
	name: z.string(),
	number: JerseyNumberSchema.optional(),
	captain: z.boolean().optional(),
});

const PlayerListSchema = PlayerSchema.array().superRefine((players, ctx) => {
	/** Jersey number to player names. */
	const reverseLookup = new Map<number | string, string[]>();
	/** Number of occurrences for each name in the roster. */
	const nameOccurs = new Map<string, number>();

	for (const { name, number } of players) {
		nameOccurs.set(name, (nameOccurs.get(name) ?? 0) + 1);
		if (number !== undefined) {
			if (!reverseLookup.has(number))
				reverseLookup.set(number, [name]);
			else
				reverseLookup.get(number)!.push(name);
		}
	}

	// Issues for duplicate names.
	for (const [name, occurrences] of nameOccurs.entries()) {
		if (occurrences > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Player names must be unique: ${occurrences} players have the same name "${name}"`,
			});
		}
	}

	// Issues for duplicate jersey numbers.
	for (const [number, names] of reverseLookup.entries()) {
		if (names.length > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Jersey numbers must be unique: ${names.join(', ')} have the same number "${number}"`,
			});
		}
	}
});

export const RosterSchema = z.object({
	caption: z.string().optional(),
	date: RosterDateSchema,
	division: DivisionSchema,
	players: PlayerListSchema,
});

import { z } from 'astro/zod';

const RosterDateSchema = z
	.stringFormat('YYYY-MM', /^\d{4}-\d{2}/)
	.pipe(z.coerce.date());

const DivisionSchema = z.enum(['mixed', 'open']);

const JerseyNumberSchema = z.union([
	z.int().min(0).lt(100),
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
				code: 'custom',
				message: `Player names must be unique: ${occurrences} players have the same name "${name}"`,
			});
		}
	}

	// Issues for duplicate jersey numbers.
	for (const [number, names] of reverseLookup.entries()) {
		if (names.length > 1) {
			ctx.addIssue({
				code: 'custom',
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

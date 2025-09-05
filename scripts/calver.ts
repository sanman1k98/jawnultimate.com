/**
 * @file
 * Utility functions for implementing our Calendar Versioning (CalVer) scheme.
 *
 * Our scheme will have three number segments and be dot-separated like in
 * SemVer. The segments `MAJOR`, `MINOR`, and `PATCH` refers to the first,
 * second, and final segments respectively.
 *
 * `YYYY.0M.PATCH`
 *
 * - `YYYY` - Full year - 2006, 2016, 2106
 * - `0M` - Zero-padded month - 01, 02 ... 11, 12
 * - `PATCH` - 0 for the first version of the month, 1 for the second, and so on
 *
 * @see {@link https://calver.org}
 * @see {@link https://semver.org}
 */

// Future-proofing: matches `2025` through `2999`.
const FULL_YEAR_RE = /202[5-9]|20[3-9]\d|2[1-9]\d{2}/;
const MAJOR_RE = FULL_YEAR_RE;

// Matches `01` through `12`.
const ZERO_PADDED_MONTH_RE = /0[1-9]|1[0-2]/;
const MINOR_RE = ZERO_PADDED_MONTH_RE;

// Matches a single `0`, or a positive digit followed by zero or more digits.
const NUMERIC_IDENTIFIER_RE = /0|[1-9]\d*/;
const PATCH_RE = NUMERIC_IDENTIFIER_RE;

const CALVER_SCHEME_RE = new RegExp(
	[MAJOR_RE, MINOR_RE, PATCH_RE]
		.map(segment => `(${segment.source})`) // Capture groups
		.join('\\.'), // Separate segments with dots
);

interface CalVerSegments {
	/** Full year. */
	major: number;
	/** One-based month i.e., `1-12`. */
	minor: number;
	/** Zero-based patch number. */
	patch: number;
}

/**
 * Parses a version identifier into segments matching our {@link CALVER_SCHEME_RE CalVer scheme RegEx}.
 * @param {string} version - A version identifier like '2025.08.3'
 * @returns {CalverSegments | null} Object containing the three segments, or `null` if `version` doesn't match scheme.
 */
export function parse(version: string): CalVerSegments | null {
	const match = CALVER_SCHEME_RE.exec(version);
	if (!match)
		return null;

	const [, fullYear, zeroPaddedMonth, patch] = match;

	if (!fullYear || !zeroPaddedMonth || !patch)
		return null;

	return {
		major: Number(fullYear),
		minor: Number(zeroPaddedMonth),
		patch: Number(patch),
	};
}

/**
 * Determine if a given version is valid according to our scheme.
 * @param {string} version - A version identifier like '2025.08.3'
 * @returns {boolean} `true` if parseable, `false` if not.
 */
export function valid(version: string): boolean {
	return Boolean(parse(version));
}

/**
 * Get CalVer segments for the given date and patch.
 * @param date - Defaults to today's date.
 * @param patch - Defaults to `0`.
 * @returns Object containing CalVer number segments.
 */
export function segments(date = new Date(), patch = 0): CalVerSegments {
	if (patch < 0 || !Number.isInteger(patch))
		throw new TypeError('patch must be a positive integer');
	else if (Number.isNaN(date.valueOf()))
		throw new TypeError('Invalid date');
	return {
		major: date.getUTCFullYear(),
		minor: date.getUTCMonth() + 1,
		patch,
	};
}

/**
 * Turn number segments into a valid CalVer string.
 * @param segments - Has valid year, one-based month, and patch.
 * @returns A valid CalVer string.
 */
export function stringify(segments: CalVerSegments): string {
	if (!(segments && 'major' in segments && 'minor' in segments && 'patch' in segments))
		throw new TypeError('Invalid segments');

	const major = String(segments.major);
	const minor = String(segments.minor).padStart(2, '0');
	const patch = String(segments.patch);

	if (!FULL_YEAR_RE.test(major))
		throw new TypeError('Invalid major number');
	else if (!ZERO_PADDED_MONTH_RE.test(minor))
		throw new TypeError('Invalid minor number');
	else if (!NUMERIC_IDENTIFIER_RE.test(patch))
		throw new TypeError('Invalid patch number');

	return `${major}.${minor}.${patch}`;
}

/**
 * Determine the next version after the given current version and date.
 * @param current - Current or latest version as a valid CalVer string.
 * @param date - Defaults to today's date.
 * @returns A valid CalVer string.
 */
export function next(current: string | null, date = new Date()): string {
	if (current === null)
		return stringify(segments(date));

	const parsed = parse(current);

	if (!parsed) {
		console.error('%o is not a valid version', current);
		throw new TypeError('Not a valid CalVer string');
	}

	const currVersionDate = new Date(`${parsed.major}-${parsed.minor}`);

	if (currVersionDate.valueOf() > date.valueOf()) {
		const dateString = date.toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
		console.error('The given version (%o) is from the future relative to the given date (%o)', current, dateString);
		throw new Error('Cannot determine next version');
	}

	const next = segments(date);

	if (next.major === parsed.major && next.minor === parsed.minor)
		next.patch = Number(parsed.patch) + 1;

	return stringify(next);
}

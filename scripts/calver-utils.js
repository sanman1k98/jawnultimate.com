/**
 * @file
 * Utility functions for implementing our Calendar Versioning (CalVer) scheme.
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

/** Matches `YYYY.0M.PATCH` CalVer scheme. */
const CALVER_SCHEME_REGEX = /^(\d{4})\.([01]\d)\.(\d+)$/;

/**
 * @typedef {object} CalverSegments - A version identifier parsed into three segments.
 * @property {string} major - Full year.
 * @property {string} minor - Zero-padded month.
 * @property {string} patch - Zero-based patch number.
 */

/**
 * Parses a version identifier into segments matching our {@link CALVER_SCHEME_REGEX CalVer scheme RegEx}.
 * @param {string} version - A version identifier like '2025.08.3'
 * @returns {CalverSegments | null} Object containing the three segments, or `null` if `version` doesn't match scheme.
 */
export function parseSegments(version) {
	const match = CALVER_SCHEME_REGEX.exec(version);
	if (!match)
		return null;

	const [, fullYear, zeroPaddedMonth, patch] = match;
	return { major: fullYear, minor: zeroPaddedMonth, patch };
}

/**
 * Get a partial version identifier for the given `date`.
 * @param {Date} [date] Defaults to today's date.
 * @returns {string} A partial version identifier with major and minor segments `YYYY.0M`.
 */
export function getCalverPrefix(date = new Date()) {
	const fullYear = date.getFullYear();
	const zeroPaddedMonth = String(date.getMonth() + 1).padStart(2, '0');
	return `${fullYear}.${zeroPaddedMonth}`;
}

/**
 * Gets the next version based on previous versions and the given `date`.
 * @param {string[]} versions - list of existing version identifiers.
 * @param {Date} [date] - The date to create to new version for (defaults to today's date)
 * @returns {string} The next version identifier following {@link CALVER_SCHEME_REGEX CalVer scheme}.
 */
export function getNextCalver(versions, date = new Date()) {
	const prefix = getCalverPrefix(date); // 'YYYY.0M'

	const nextPatch = versions
		.filter(v => v.startsWith(prefix)) // Only versions for this month
		.map(v => parseSegments(v))
		.filter(Boolean) // Filter versions not matching CalVer scheme
		.map(segments => Number(segments.patch)) // Get the patches for this month
		.reduce((a, b) => Math.max(a, b), -1) + 1; // Get the latest patch and increment

	return `${prefix}.${nextPatch}`;
}

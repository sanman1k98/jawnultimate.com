/**
 * **YYYY.0M.PATCH**
 *
 * - **YYYY** - Full year - 2006, 2016, 2106
 * - **0M** - Zero-padded month - 01, 02 ... 11, 12
 * - **PATCH** - 0 for the first version of the month, 1 for the second version, and so on
 *
 * @see {@link https://calver.org}
 */
const CALVER_SCHEME_REGEX = /^(\d{4})\.([01]\d)\.(\d+)$/;

/**
 * Get a partial version identifier for the given `date`.
 * @param {Date} [date] Defaults to today's date.
 * @returns {string} A partial version identifier with year and month segments **YYYY.0M**.
 */
export function getCalverPrefix(date = new Date()) {
	const fullYear = date.getFullYear();
	const zeroPaddedMonth = String(date.getMonth() + 1).padStart(2, '0');
	return `${fullYear}.${zeroPaddedMonth}`;
}

/**
 * @typedef CalverSegments
 * @prop {string} major - The full year.
 * @prop {string} minor - Zero-padded month.
 * @prop {string} patch - Starts at `0` for the first version of the month.
 */

/**
 * Parses a version identifier into segments matching the {@link CALVER_SCHEME_REGEX CalVer scheme}.
 * @param {string} version - A version identifier like '2025.08.3'
 * @returns {CalverSegments | null} `null` if argument does not match version scheme.
 */
export function parseSegments(version) {
	const match = CALVER_SCHEME_REGEX.exec(version);
	if (!match)
		return null;

	const [, year, month, patch] = match;
	return { major: year, minor: month, patch };
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

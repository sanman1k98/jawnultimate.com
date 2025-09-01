const CALVER_REGEX = /^v(\d{4})\.(\d{2})\.(\d+)$/;

/**
 * Returns the current CalVer prefix like 'v2025.08'.
 * @param {Date} [date]
 * @returns {string} A CalVer prefix like 'v2025.08'.
 */
export function getCurrentCalverTagPrefix(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // 01-12
	return `v${year}.${month}`;
}

/**
 * Filters a list of tags to only match the vYYYY.0M.patch format.
 * @param {string[]} tags
 * @returns {string[]} filtered tags
 */
export function filterCalverTags(tags) {
	return tags.filter(tag => CALVER_REGEX.test(tag));
}

/**
 * Parses a CalVer tag into parts.
 * @param {string} tag - A tag like 'v2025.08.3'
 * @returns {{ year: number, month: number, patch: number }} or null
 */
export function parseCalver(tag) {
	const match = CALVER_REGEX.exec(tag);
	if (!match)
		return null;

	const [, year, month, patch] = match;
	return {
		year: Number(year),
		month: Number(month),
		patch: Number(patch),
	};
}

/**
 * Gets the next CalVer tag based on existing tags.
 * @param {string[]} existingTags - list of git tags
 * @param {Date} [now] - optional Date object for testing
 * @returns {string} next tag, e.g., 'v2025.08.0' or 'v2025.08.3'
 */
export function getNextCalverTag(existingTags, now = new Date()) {
	const prefix = getCurrentCalverTagPrefix(now); // e.g., 'v2025.08'
	const matching = filterCalverTags(existingTags).filter(tag =>
		tag.startsWith(`${prefix}.`),
	);

	const patches = matching
		.map(tag => parseCalver(tag))
		.filter(Boolean)
		.map(parsed => parsed.patch);

	const nextPatch = patches.length > 0 ? Math.max(...patches) + 1 : 0;

	return `${prefix}.${nextPatch}`;
}

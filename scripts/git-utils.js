import { exec } from './proc-utils';

/**
 * Creates an annotated Git tag.
 * @param {string} tagName - The name of the tag.
 * @param {string} message - The message to annotate the tag with.
 * @returns {Promise<void>}
 */
export async function createGitTag(tagName, message) {
	if (!tagName) {
		throw new Error('tagName is required.');
	} else if (!message) {
		throw new Error('message is required');
	}

	return exec('git', ['tag', '--sign', tagName, '--message', message]).catch((err) => {
		throw new Error(`Failed to create tag ${tagName}`, { cause: err });
	});
}

/**
 * Retrieves a list of Git tags.
 * @returns {Promise<string[]>} - Array of tag names.
 */
export async function getGitTags() {
	return exec('git', ['tag'])
		.then(({ stdout }) => stdout.trim().split('\n'))
		.catch((err) => {
			throw new Error('Failed to get tags', { cause: err });
		});
}

/**
 * Checks if the Git working tree is clean (no uncommitted changes).
 * @returns {Promise<boolean>} - True if clean, false otherwise.
 */
export async function isWorkingTreeClean() {
	return exec('git', ['status', '--porcelain'])
		.then(({ stdout }) => stdout.trim().length === 0)
		.catch((err) => {
			throw new Error('Failed to check status of working tree', { cause: err });
		});
}

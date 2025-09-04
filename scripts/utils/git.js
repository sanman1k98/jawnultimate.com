import { exec } from './proc.js';

/**
 * Creates an annotated Git tag.
 * @param {string} tagName - The name of the tag.
 * @param {string} message - The message to annotate the tag with.
 * @returns {Promise<void>}
 */
export async function createGitTag(tagName, message) {
	if (!tagName) {
		throw new TypeError('tagName is required.');
	} else if (!message) {
		throw new TypeError('message is required');
	}

	return void exec('git', ['tag', '--sign', tagName, '--message', message]).catch((err) => {
		throw new Error(`Failed to create tag ${tagName}`, { cause: err });
	});
}

/**
 * Retrieves a list of Git tags sorted by version in ascending order.
 * @returns {Promise<string[]>} - Array of tag names.
 */
export async function getGitTags() {
	return exec('git', ['tag', '--sort=version:refname'])
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

/**
 * Get the current Git branch.
 * @returns {Promise<string>} The name of the branch.
 */
export async function getCurrentBranch() {
	return exec('git', ['branch', '--show-current'])
		.then(({ stdout }) => stdout.trim())
		.catch((err) => {
			throw new Error('Failed to get current branch', { cause: err });
		});
}

/**
 * @param {string} branch - Name of the branch to check.
 * @returns {Promise<boolean>} True if local is synced with origin.
 */
export async function checkSyncStatus(branch) {
	return exec('git', ['fetch', 'origin', branch])
		.catch((err) => {
			throw new Error(`Failed to fetch remote branch ${branch} from origin`, { cause: err });
		})
		.then(() => exec('git', ['rev-parse', `origin/${branch}`, branch]))
		.then(({ stdout }) => stdout.trim().split('\n'))
		.then(([remoteHash, localHash]) => remoteHash === localHash)
		.catch((err) => {
			throw new Error('Failed to get hashes', { cause: err });
		});
}

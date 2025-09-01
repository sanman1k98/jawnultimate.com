import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(_exec);

/**
 * Creates a lightweight Git tag.
 * @param {string} tagName - The name of the tag.
 * @param {string} [commit] - Optional commit hash or ref. Defaults to HEAD.
 * @returns {Promise<void>}
 */
export async function createGitTag(tagName, commit = 'HEAD') {
	if (!tagName) {
		throw new Error('tagName is required.');
	}

	try {
		await exec(`git tag ${tagName} ${commit}`);
		console.log(`Lightweight tag '${tagName}' created on ${commit}`);
	} catch (err) {
		throw new Error(`Failed to create lightweight tag: ${err.stderr || err.message}`);
	}
}

/**
 * Retrieves a list of Git tags.
 * @returns {Promise<string[]>} - Array of tag names.
 */
export async function getGitTags() {
	try {
		const { stdout } = await exec('git tag');
		return stdout.trim().split('\n').filter(tag => tag);
	} catch (err) {
		throw new Error(`Failed to get tags: ${err.stderr || err.message}`);
	}
}

/**
 * Checks if the Git working tree is clean (no uncommitted changes).
 * @returns {Promise<boolean>} - True if clean, false otherwise.
 */
export async function isWorkingTreeClean() {
	try {
		const { stdout } = await exec('git status --porcelain');
		return stdout.trim().length === 0;
	} catch (err) {
		throw new Error(`Failed to check working tree status: ${err.stderr || err.message}`);
	}
}

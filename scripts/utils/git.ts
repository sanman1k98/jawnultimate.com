import { exec } from './proc.ts';

/**
 * Creates an annotated Git tag.
 * @param tagName - The name of the tag.
 * @param message - The message to annotate the tag with.
 */
export async function createGitTag(tagName: string, message: string): Promise<void> {
	if (typeof tagName !== 'string')
		throw new TypeError('Invalid tag name');
	else if (typeof message !== 'string')
		throw new TypeError('Invalid message');
	return void exec('git', ['tag', '--sign', tagName, '--message', message]);
}

/**
 * Retrieves a list of Git tags sorted by version in ascending order.
 * @returns Array of tag names.
 */
export async function getGitTags(): Promise<string[]> {
	return exec('git', ['tag', '--sort=version:refname'])
		.then(p => p.stdout.trim().split('\n'));
}

/**
 * Get the status of the working tree in short-format.
 */
export async function getShortStatus(): Promise<string> {
	return exec('git', ['status', '--short']).then(p => p.stdout.trim());
}

/**
 * Checks if the Git working tree is clean (no uncommitted changes).
 * @returns True if clean, false otherwise.
 */
export async function isWorkingTreeClean(): Promise<boolean> {
	return exec('git', ['status', '--porcelain'])
		.then(({ stdout }) => stdout.trim().length === 0)
		.catch((err) => {
			throw new Error('Failed to check status of working tree', { cause: err });
		});
}

/**
 * Get the current Git branch.
 * @returns The name of the branch.
 */
export async function getCurrentBranch(): Promise<string> {
	return exec('git', ['branch', '--show-current']).then(p => p.stdout.trim());
}

/**
 * @param branch - Name of the branch to check.
 * @returns True if local is synced with origin.
 */
export async function checkSyncStatus(branch: string): Promise<boolean> {
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

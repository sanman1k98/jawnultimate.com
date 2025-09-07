import { exec } from './proc.ts';

/**
 * Creates an annotated Git tag.
 * @param tagName - The name of the tag.
 * @param message - The message to annotate the tag with.
 */
export async function createTag(tagName: string, message: string): Promise<void> {
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
export async function getTags(): Promise<string[]> {
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
 * @returns The name of the current branch or `null` if detatched.
 */
export async function getCurrentBranch(): Promise<string | null> {
	return exec('git', ['branch', '--show-current']).then(p => p.stdout.trim() || null);
}

/**
 * @param branch - Name of the branch to check.
 * @returns True if local is synced with origin.
 */
export async function inSyncWithOrigin(branch: string): Promise<boolean> {
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

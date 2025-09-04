import { exit } from 'node:process';
import { parseArgs } from 'node:util';
import * as CalVer from './calver-utils.js';
import { checkSyncStatus, createGitTag, getCurrentBranch, getGitTags, isWorkingTreeClean } from './utils/git.js';
import { run } from './utils/proc.js';

const UPLOAD_BRANCH = 'main';

/**
 * Determine the next CalVer identifier, create a new Git tag for it, upload a
 * new version to Cloudflare, and push the new tag.
 * @param {object} opts
 * @param {boolean | undefined} opts.dryRun Don't actually create a new tag or upload to Cloudflare.
 */
async function upload(opts) {
	try {
		console.log('Checking if current branch is main...');
		if (await getCurrentBranch() !== UPLOAD_BRANCH) {
			throw new Error('Can only upload new versions from main branch');
		}

		console.log('Checking if working tree is clean...');
		const clean = await isWorkingTreeClean();
		if (opts.dryRun && !clean) {
			console.warn('[Dry run] Working tree is not clean.');
		} else if (!clean) {
			throw new Error('Working tree is not clean. Commit or stash your changes before uploading a new version.');
		}

		console.log('Checking if local branch is in sync with remote...');
		const synced = await checkSyncStatus(UPLOAD_BRANCH);
		if (opts.dryRun && !synced) {
			console.warn('[Dry run] Local branch not in sync with remote.');
		} else if (!synced) {
			throw new Error('Local branch is not in sync with remote. Pull remote changes and/or push local changes before uploading a new version');
		}

		const versionTags = await getGitTags().then(tags => tags.filter(t => t.startsWith('v')));
		const currentVersion = versionTags.pop()?.slice(1) ?? null;
		const nextVersion = CalVer.next(currentVersion);
		console.log('Next version: %o -> %o', currentVersion, nextVersion);

		if (opts.dryRun) {
			console.log('[Dry run] Returning early.');
			return;
		}

		const tagName = `v${nextVersion}`;
		const message = `chore: release version ${nextVersion}`;

		await createGitTag(tagName, message);
		console.log('Created tag %o', tagName);

		console.log('Uploading new version with Wrangler...\n');
		await run('pnpm', ['exec', 'wrangler', 'versions', 'upload', '--tag', tagName]);

		console.log('Pushing tag %o to origin...\n', tagName);
		await run('git', ['push', tagName]);

		console.log('\n✅ Upload complete.');
	} catch (err) {
		if (err instanceof Error) {
			console.error('\n❌ Upload failed: %o', err.message);
			if ('cause' in err)
				console.error(err.cause);
			exit(1);
		}
		throw new Error('\n❌ Unknown error occured in `upload()` function', { cause: err });
	}
}

async function main() {
	/** @satisfies {import('node:util').ParseArgsOptionsConfig} */
	const options = {
		'dry-run': { type: 'boolean' },
	};

	const { values } = parseArgs({ options });
	const opts = { dryRun: values['dry-run'] };

	upload(opts);
}

main();

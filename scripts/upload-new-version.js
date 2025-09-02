import { exit } from 'node:process';
import { getNextCalverTag } from './calver-utils.js';
import { checkSyncStatus, createGitTag, getCurrentBranch, getGitTags, isWorkingTreeClean } from './git-utils.js';
import { run } from './proc-utils.js';

const UPLOAD_BRANCH = 'main';

async function upload() {
	try {
		console.log('Checking if current branch is main...');
		if (await getCurrentBranch() !== UPLOAD_BRANCH) {
			throw new Error('Can only upload new versions from main branch');
		}

		// 1. Ensure working tree is clean
		console.log('Checking if working tree is clean...');
		const clean = await isWorkingTreeClean();
		if (!clean) {
			throw new Error('Working tree is not clean. Commit or stash your changes before uploading a new version.');
		}

		console.log('Checking if local branch is in sync with remote...');
		const synced = await checkSyncStatus(UPLOAD_BRANCH);
		if (!synced) {
			throw new Error('Local branch is not in sync with remote. Pull remote changes and/or push local changes before uploading a new version');
		}

		// 2. Get existing Git tags.
		console.log('Getting existing tags...');
		const existingTags = await getGitTags();

		const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'medium' });
		const now = new Date();

		// 3. Compute next CalVer tag.
		const nextTag = getNextCalverTag(existingTags, now);
		const message = formatter.format(now);

		// 4. Create the new Git tag.
		console.log('Creating new tag...');
		await createGitTag(nextTag, message);
		console.log(`Git tag '${nextTag}' created.`);

		console.log('Pushing all tags to origin...');
		await run('git', ['push', '--tags']);
		console.log('Tags pushed');

		// 5. Upload new version to Cloudflare Workers
		console.log('Uploading new version with Wrangler...\n');
		await run('pnpm', ['exec', 'wrangler', 'versions', 'upload', '--tag', nextTag]);
		console.log('\n✅ Upload complete.');
	} catch (err) {
		console.error('\n❌ Upload failed:', err.message);
		exit(1);
	}
}

upload();

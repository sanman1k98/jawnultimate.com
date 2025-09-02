import { exit } from 'node:process';
import { getNextCalver } from './calver-utils.js';
import { checkSyncStatus, createGitTag, getCurrentBranch, getGitTags, isWorkingTreeClean } from './git-utils.js';
import { run } from './proc-utils.js';

const UPLOAD_BRANCH = 'main';

async function upload() {
	try {
		console.log('Checking if current branch is main...');
		if (await getCurrentBranch() !== UPLOAD_BRANCH) {
			throw new Error('Can only upload new versions from main branch');
		}

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

		const existingVersions = await getGitTags().then(tags =>
			tags
				.filter(tag => tag.startsWith('v'))
				.map(tag => tag.slice(1)),
		);

		const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'medium' });
		const now = new Date();

		const nextVersion = getNextCalver(existingVersions, now);
		const tagName = `v${nextVersion}`;
		const message = formatter.format(now);

		console.log('Creating new tag...');
		await createGitTag(tagName, message);
		console.log(`Git tag '${tagName}' created.`);

		console.log('Pushing all tags to origin...');
		await run('git', ['push', '--tags']);
		console.log('Tags pushed');

		console.log('Uploading new version with Wrangler...\n');
		await run('pnpm', ['exec', 'wrangler', 'versions', 'upload', '--tag', tagName]);
		console.log('\n✅ Upload complete.');
	} catch (err) {
		console.error('\n❌ Upload failed:', err.message);
		exit(1);
	}
}

upload();

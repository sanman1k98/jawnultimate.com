import { spawn } from 'node:child_process';
import { exit } from 'node:process';
import { getNextCalverTag } from './calver-utils.js';
import { createGitTag, getGitTags, isWorkingTreeClean } from './git-utils.js';

async function runCommandLive(command, args = []) {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, { stdio: 'inherit' });

		proc.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${command} exited with code ${code}`));
			}
		});
	});
}

async function upload() {
	try {
		// 1. Ensure working tree is clean
		console.log('Checking if working tree is clean...');
		const clean = await isWorkingTreeClean();
		if (!clean) {
			throw new Error('Working tree is not clean. Commit or stash your changes before uploading a new version.');
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
		await runCommandLive('git', ['push', '--tags']);
		console.log('Tags pushed');

		// 5. Upload new version to Cloudflare Workers
		console.log('Uploading new version with Wrangler...\n');
		await runCommandLive('pnpm', ['exec', 'wrangler', 'versions', 'upload', '--tag', nextTag]);
		console.log('\n✅ Upload complete.');
	} catch (err) {
		console.error('\n❌ Upload failed:', err.message);
		exit(1);
	}
}

upload();

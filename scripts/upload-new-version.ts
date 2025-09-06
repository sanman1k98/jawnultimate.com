import type { ParseArgsOptionsConfig } from 'node:util';
import { exit, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import * as CalVer from './calver.ts';
import { getLastModifiedDuration } from './utils/fs.ts';
import * as Git from './utils/git.ts';
import { logger } from './utils/log.ts';
import { run } from './utils/proc.ts';

interface UploadOptions {
	/** Don't actually create a new tag or upload to Cloudflare. */
	dryRun?: boolean | undefined;
	/** Don't error or exit early if checks fail. */
	warnOnly?: boolean | undefined;
};

/**
 * Determine the next CalVer identifier, create a new Git tag for it, upload a
 * new version to Cloudflare, and push the new tag.
 */
async function upload(opts: UploadOptions) {
	logger.info('Starting status checks.');

	let currentBranch: string;
	let status: string;
	let inSync: boolean;

	try {
		currentBranch = await Git.getCurrentBranch();
		status = await Git.getShortStatus();
		inSync = await Git.inSyncWithOrigin(currentBranch);
	} catch (err) {
		throw new Error('Error attempting status checks', { cause: err });
	}

	const statusCheckErrors: Error[] = [];

	if (currentBranch !== 'main') {
		const err = new Error('Not on main branch', { cause: { currentBranch } });
		statusCheckErrors.push(err);
	}

	if (status) {
		const err = new Error('Working tree is not clean', { cause: status });
		statusCheckErrors.push(err);
	}

	if (!inSync) {
		const err = new Error('Local branch is not in sync with remote');
		statusCheckErrors.push(err);
	}

	if (statusCheckErrors.length) {
		if (opts.warnOnly) {
			for (const err of statusCheckErrors) {
				const fmt = 'Failed check: %s';
				logger.warn(fmt, err.message);
			}
		} else {
			const aggError = new AggregateError(statusCheckErrors, 'Did not pass status checks');
			logger.error(aggError);
			exit(1);
		}
	} else {
		logger.info('Passed all checks');
	}

	try {
		const versionTags = await Git.getTags().then(tags => tags.filter(t => t.startsWith('v')));
		const currentVersion = versionTags.pop()?.slice(1) ?? null;
		const nextVersion = CalVer.next(currentVersion);
		logger.log('Next version: %o -> %o', currentVersion, nextVersion);

		const lastRanBuild = await getLastModifiedDuration('./dist');
		logger.log('Last ran build %o ago.', new Intl.DurationFormat().format(lastRanBuild));

		{
			using rl = createInterface({ input: stdin, output: stdout });
			const signal = AbortSignal.timeout(15_000);

			const proceed = await rl
				.question('\nProceed with deployment? (enter/ctrl-c)\n', { signal })
				.then(value => value.trim() === '')
				.catch(() => false);

			if (signal.aborted)
				return logger.error('Timed out.');
			else if (proceed === false)
				return logger.log('Cancelled.');
			else if (proceed === true)
				logger.log('Proceeding...');
		}

		if (opts.dryRun) {
			logger.log('[Dry run] Returning early.');
			return;
		}

		const tagName = `v${nextVersion}`;
		const message = `chore: release version ${nextVersion}`;

		await Git.createTag(tagName, message);
		logger.log('Created tag %o', tagName);

		logger.log('Uploading new version with Wrangler...\n');
		await run('pnpm', ['exec', 'wrangler', 'versions', 'upload', '--tag', tagName]);

		logger.log('Pushing tag %o to origin...\n', tagName);
		await run('git', ['push', 'origin', tagName]);

		logger.log('\n✅ Upload complete.');
	} catch (err) {
		if (err instanceof Error) {
			logger.error('\n❌ Upload failed: %o', err.message);
			if ('cause' in err)
				logger.error(err.cause);
			exit(1);
		}
		throw new Error('\n❌ Unknown error occured in `upload()` function', { cause: err });
	}
}

async function main() {
	const options = {
		'dry-run': { type: 'boolean' },
		'warn-only': { type: 'boolean' },
	} satisfies ParseArgsOptionsConfig;

	const { values } = parseArgs({ options });

	upload({
		dryRun: values['dry-run'],
		warnOnly: values['warn-only'],
	});
}

main();

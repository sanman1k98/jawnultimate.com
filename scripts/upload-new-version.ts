import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import * as CalVer from './calver.ts';
import { startPreDeployChecks } from './checks.ts';
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
	await Promise.allSettled(startPreDeployChecks()).then((checks) => {
		const errors = checks
			.filter(check => check.status === 'rejected')
			.map(res => res.reason);

		if (errors.length) {
			const aggError = new AggregateError(errors, 'Failed pre-deploy checks');
			if (opts.warnOnly) {
				logger.warn(aggError.message, '\n');
				logger.warn(aggError, '\n');
			} else {
				logger.error(aggError.message, '\n');
				throw aggError;
			}
		} else {
			logger.info('Passed pre-deploy checks');
		}
	});

	const versionTags = await Git.getTags().then(tags => tags.filter(t => t.startsWith('v')));
	const currentVersion = versionTags.pop()?.slice(1) ?? null;
	const nextVersion = CalVer.next(currentVersion);
	logger.info('Next version: %o -> %o', currentVersion, nextVersion);

	const lastRanBuild = await getLastModifiedDuration('./dist');
	logger.info('Last ran build %o ago.', new Intl.DurationFormat().format(lastRanBuild));

	{
		using rl = createInterface({ input: process.stdin, output: process.stdout });
		const signal = AbortSignal.timeout(15_000);

		const proceed = await rl
			.question('\nProceed with deployment? (enter/ctrl-c)\n', { signal })
			.then(value => value.trim() === '')
			.catch(() => false);

		if (signal.aborted)
			return logger.log('Timed out.');
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
}

export async function cmd(opts = { args: process.argv.slice(2) }) {
	const { values } = parseArgs({
		args: opts.args,
		options: {
			'dry-run': { type: 'boolean' },
			'warn-only': { type: 'boolean' },
		},
	});

	const { 'dry-run': dryRun, 'warn-only': warnOnly } = values;
	return upload({ dryRun, warnOnly });
}

if (import.meta.main)
	cmd();

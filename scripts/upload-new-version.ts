import { exit, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import * as CalVer from './calver.ts';
import { getLastModifiedDuration } from './utils/fs.ts';
import * as Git from './utils/git.ts';
import { logger } from './utils/log.ts';
import { run } from './utils/proc.ts';

/**
 * Checks that the working tree is clean and the local branch is in sync with origin.
 * @throws {AggregateError} Thrown if a check does not pass.
 */
async function statusChecks(): Promise<true> {
	const errors: Error[] = [];

	const branch = await Git.getCurrentBranch();
	if (branch !== 'main') {
		errors.push(
			new Error('Not on main branch', { cause: { branch } }),
		);
	}

	const status = await Git.getShortStatus();
	if (status) {
		errors.push(
			new Error('Working tree is not clean', { cause: status.split('\n') }),
		);
	}

	const inSync = await Git.inSyncWithOrigin(branch);
	if (!inSync) {
		errors.push(
			new Error('Local branch is not in sync with origin'),
		);
	}

	if (errors.length)
		throw new AggregateError(errors, 'Failed status checks');
	return true;
}

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
	try {
		await statusChecks();
		logger.info('Passed status checks');
	} catch (err) {
		if (err instanceof AggregateError) {
			const log = opts.warnOnly ? logger.warn : logger.error;
			for (const { message, cause } of err.errors as Error[]) {
				const args: any[] = [message];
				cause && args.push(cause);
				log(...args);
			}
			log('Failed status checks');
			if (!opts.warnOnly) {
				logger.log('Aborting');
				exit(1);
			}
		} else if (err instanceof Error) {
			const e = new Error('Unhandled exception', { cause: err });
			logger.error(e);
			throw e;
		} else {
			const e = new Error('Unknown exception', { cause: err });
			logger.error(e);
			throw e;
		}
	}

	const versionTags = await Git.getTags().then(tags => tags.filter(t => t.startsWith('v')));
	const currentVersion = versionTags.pop()?.slice(1) ?? null;
	const nextVersion = CalVer.next(currentVersion);
	logger.info('Next version: %o -> %o', currentVersion, nextVersion);

	const lastRanBuild = await getLastModifiedDuration('./dist');
	logger.info('Last ran build %o ago.', new Intl.DurationFormat().format(lastRanBuild));

	{
		using rl = createInterface({ input: stdin, output: stdout });
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

async function main() {
	const cliArgs = parseArgs({
		options: {
			'dry-run': { type: 'boolean' },
			'warn-only': { type: 'boolean' },
		},
	});

	const {
		'dry-run': dryRun,
		'warn-only': warnOnly,
	} = cliArgs.values;


	upload({ dryRun, warnOnly });
}

main();

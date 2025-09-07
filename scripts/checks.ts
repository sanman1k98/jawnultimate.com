import * as Git from './utils/git.ts';

export class CheckFailure extends Error {
	public hint: string;

	constructor(message: string, options: { hint: string }) {
		super(message);
		this.hint = options.hint;
	}
}

async function checkCurrentBranchIsMain() {
	const branch = await Git.getCurrentBranch();
	if (branch !== 'main') {
		throw new CheckFailure('Not on main branch', {
			hint: 'Switch to main branch',
		});
	}
}

async function checkWorkingTreeIsClean() {
	const status = await Git.getShortStatus();
	if (status) {
		throw new CheckFailure('Working tree is not clean', {
			hint: 'Commit or stash changes',
		});
	}
}

async function checkInSyncWithOrigin() {
	const inSync = await Git.getCurrentBranch().then(Git.inSyncWithOrigin);
	if (!inSync) {
		throw new CheckFailure('Local is not in-sync with origin', {
			hint: 'Pull and/or push changes to and/or from origin',
		});
	}
}

/** @returns An iterable of pending promises. */
export function startPreDeployChecks() {
	return [
		checkCurrentBranchIsMain(),
		checkWorkingTreeIsClean(),
		checkInSyncWithOrigin(),
	];
}

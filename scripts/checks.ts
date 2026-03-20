import { check, checklist, run } from './utils/check.ts';
import * as Git from './utils/git.ts';

checklist('pre-deploy', () => {
	check('on main branch', async () => {
		return Git.getCurrentBranch().then(branch => branch === 'main');
	});

	check('working tree is clean', async () => {
		return Git.getShortStatus().then(status => !status);
	});

	check('local in-sync with remote', async () => {
		return Git.inSyncWithOrigin();
	});
});

if (import.meta.main)
	run();

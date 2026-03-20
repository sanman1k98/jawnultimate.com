/**
 * @file
 * Checks to run before building and deploying.
 */

import assert from 'node:assert/strict';
import { test as check, suite as checklist } from 'node:test';
import * as Git from './utils/git.ts';

checklist('predeploy', () => {
	check('on main branch', async () => {
		assert.equal(await Git.getCurrentBranch(), 'main', 'not on main');
	});

	check('working tree is clean', async () => {
		assert.equal(
			await Git.getShortStatus().then(st => st.split('\n').length),
			0,
			'working tree is dirty',
		);
	});

	check('in-sync with origin', async () => {
		assert(await Git.inSyncWithOrigin(), 'not in-sync with origin');
	});
});

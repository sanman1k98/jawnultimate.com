import { AsyncResource, executionAsyncId } from 'node:async_hooks';

const allChecks = new Map<number, Check | CheckList>();

interface _CheckInterface {
	parent: _CheckInterface | null;
	name: string;
	fn: undefined | (() => any);
}

class Check extends AsyncResource {
	parent: CheckList | null;
	name: string;
	fn: () => boolean | Promise<boolean>;
	pass: boolean;
	error: unknown | null;

	constructor(opts: { name: string; parent: CheckList | null; fn: () => boolean | Promise<boolean> }) {
		super('Check');
		this.parent = opts.parent instanceof CheckList ? opts.parent : null;
		this.name = opts.name;
		this.fn = opts.fn;
		this.pass = false;
		this.error = null;
	}

	async run() {
		try {
			this.pass = await this.runInAsyncScope(this.fn, null);
			return this.pass;
		} catch (err) {
			this.error = err;
			throw this.error;
		}
	}
}

class CheckList extends AsyncResource {
	parent: CheckList | null;
	name: string;
	fn: (() => void) | undefined;

	constructor(opts: { name: string; parent: CheckList | null; fn: () => void }) {
		super('CheckList');
		this.parent = opts.parent instanceof CheckList ? opts.parent : null;
		this.name = opts.name;
		this.fn = opts.fn;
	}

	/** */
	collect() {
		console.log('Collecting %o checks', this.name);
		// Invoke callback creating new Checks and CheckLists;
		this.fn &&= void this.runInAsyncScope(this.fn, null);
	}
}

function defineCheck(name: string, fn: () => boolean | Promise<boolean>) {
	const parent = allChecks.get(executionAsyncId()) ?? null;
	if (parent instanceof Check)
		throw new Error('Cannot nest checks');
	const c = new Check({ name, parent, fn });
	allChecks.set(c.asyncId(), c);
}

function defineChecklist(name: string, fn: () => void) {
	const parent = allChecks.get(executionAsyncId()) ?? null;
	if (parent instanceof Check)
		throw new Error('Cannot define checklists within checks');
	const cl = new CheckList({ name, parent, fn });
	allChecks.set(cl.asyncId(), cl);
}

function collectAll() {
	allChecks.forEach(
		checklist => checklist instanceof CheckList && checklist.collect(),
	);
}

/**
 * @param names - Names of checks to run.
 */
export async function run(names?: string | string[]) {
	collectAll();

	console.log('\n');

	const checks = Array.from(allChecks.values().filter(check => check instanceof Check));
	const pendingChecks = checks.map(check => check.run());
	await Promise.all(pendingChecks).then(() => {
		checks.forEach(c => console.log(c.name, c.error, c.pass));
	});
}

export {
	defineCheck as check,
	defineChecklist as checklist,
};

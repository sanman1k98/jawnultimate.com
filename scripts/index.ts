import type { RunOptions } from 'node:test';

const SCRIPT_NAMES = ['upload-new-version', 'checks'] as const;
type ScriptName = typeof SCRIPT_NAMES[number];

function isScript(script: string): script is ScriptName {
	return SCRIPT_NAMES.includes(script as ScriptName);
}

async function cmd() {
	const script = process.argv[2];
	const args = process.argv.slice(3);

	if (!script)
		throw new TypeError('Missing script argument', { cause: { script } });
	else if (!isScript(script))
		throw new RangeError('Not a valid script', { cause: { script } });

	const modName = `./${script}.ts`;
	switch (script) {
		case 'upload-new-version': return await import(modName).then(m => m.cmd({ args }));
		case 'checks': {
			const { parseArgs } = await import('node:util');

			const { values } = parseArgs({ args, options: {
				testNamePatterns: { type: 'string', multiple: true },
			} });

			const { dot } = await import('node:test/reporters');
			const { run } = await import('node:test');

			const opts: RunOptions = {
				cwd: import.meta.dirname,
				files: [modName],
				testNamePatterns: values.testNamePatterns,
			};

			run(opts)
				.on('test:fail', () => process.exitCode = 1)
				.compose(dot)
				.pipe(process.stdout);
		}
	}
}

if (!import.meta.main)
	throw new Error('Do not import this module');

cmd();

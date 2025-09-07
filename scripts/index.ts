const SCRIPT_NAMES = ['upload-new-version'] as const;
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
	}
}

if (!import.meta.main)
	throw new Error('Do not import this module');

cmd();

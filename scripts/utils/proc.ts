import type { SpawnOptions } from 'node:child_process';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

/** Promisified wrapper around `child_process.execFile`. */
export const exec = promisify(execFile);

/**
 * Run a command with live input and output.
 * @param command - Command to run.
 * @param args - List of arguments.
 * @param options - Override opts passed to `spawn`.
 * @param options.stdio - Defaults to 'inherit' (for live output and input).
 */
export async function run(
	command: string,
	args: string[] = [],
	options: SpawnOptions = { stdio: 'inherit' },
): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!('stdio' in options))
			options.stdio = 'inherit';
		spawn(command, args, options)
			.on('error', err => reject(new Error('Command failed to spawn', { cause: err })))
			.on('close', code =>
				code
					? reject(new Error('Command exited non-zero', { cause: { code } }))
					: resolve());
	});
}

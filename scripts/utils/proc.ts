import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

/**
 * Promisified wrapper around `child_process.execFile`.
 * @param {string} command
 * @param {string[]} [args]
 */
export const exec = promisify(execFile);

/**
 * Run `command` with live output.
 * @param {string} command
 * @param {string[]} [args]
 * @returns {Promise<void>}
 */
export async function run(command, args = []) {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, { stdio: 'inherit' });

		proc.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${command} exited with code ${code}`));
			}
		});
	});
}

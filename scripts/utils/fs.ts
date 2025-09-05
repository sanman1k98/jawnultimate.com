import type { PathLike } from 'node:fs';
import { stat } from 'node:fs/promises';

interface LastModifiedDuration {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

/**
 * Create a duration object from the time the given path was last modified until now.
 * @returns An object to be used with `Intl.DurationFormat.prototype.format()`.
 */
export async function getLastModifiedDuration(path: PathLike): Promise<LastModifiedDuration> {
	return stat(path)
		.then(({ mtime }) => Date.now() - mtime.valueOf())
		.then(ms => ({
			seconds: Math.floor(ms / 1000) % 60,
			minutes: Math.floor(ms / (1000 * 60)) % 60,
			hours: Math.floor(ms / (1000 * 60 * 60)) % 24,
			days: Math.floor(ms / (1000 * 60 * 60 * 24)),
		}));
}

import { styleText } from 'node:util';

const timeFormat = new Intl.DateTimeFormat('en-US', {
	hour12: false,
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
});

function styledTime() {
	const now = new Date();
	const text = timeFormat.format(now);
	return styleText(['dim', 'white'], text);
}

const LOG_LEVELS = /** @type {const} */(['log', 'warn', 'error']);

/** @typedef {Extract<keyof typeof console, typeof LOG_LEVELS[number]>} LogLevel */
/** @typedef {typeof console.log} LogFn A `console.log` like function. */
/** @typedef {{ [k in LogLevel]: LogFn }} Logger Custom logger. */

/**
 * @param {object} opts
 * @param {LogLevel} opts.level
 * @returns {LogFn} A `console.log`-like function.
 */
function createLogFn(opts) {
	/** @satisfies {LogFn} */
	const logFn = (...args) => {
		const log = console[opts.level];
		const ts = styledTime();
		if (typeof args[0] === 'string') {
			log(`${ts} ${args[0]}`, ...args.slice(1));
		} else {
			log(ts, ...args);
		}
	};

	return logFn;
}

export const logger = /** @type {Logger} */ (Object.fromEntries(
	LOG_LEVELS.map(level => [level, createLogFn({ level })]),
));

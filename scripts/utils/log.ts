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

const LOG_LEVELS = ['log', 'warn', 'error'] as const;

type LogLevel = Extract<keyof typeof console, typeof LOG_LEVELS[number]>;
type LogFn = typeof console.log;
type Logger = { [k in LogLevel]: LogFn };

/**
 * @param {object} opts
 * @param {LogLevel} opts.level
 * @returns {LogFn} A `console.log`-like function.
 */
function createLogFn(opts: { level: LogLevel }): LogFn {
	/** @satisfies {LogFn} */
	const logFn = (...args: unknown[]) => {
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

export const logger = Object.fromEntries(
	LOG_LEVELS.map(level => [level, createLogFn({ level })]),
) as Logger;

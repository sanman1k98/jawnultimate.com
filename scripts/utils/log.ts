import { styleText } from 'node:util';

const timeFormat = new Intl.DateTimeFormat('en-US', {
	hour12: false,
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
});

function timestamp() {
	const now = new Date();
	const text = timeFormat.format(now);
	return styleText(['dim', 'white'], text);
}

type LogFn = (...args: any[]) => void;

interface MessageFormatOptions {
	/** Set to `false` to disable the timestamp. */
	timestamp?: boolean;
	/** Additional text to show after the timestamp and before the message. */
	addText?: string[];
}

/** Wrap `console` method with a timestamp and additional text. */
function wrapMethod(fn: LogFn, opts?: MessageFormatOptions): LogFn {
	return (...args: any[]) => {
		const text = Array.from(opts?.addText ?? []);
		if (opts?.timestamp !== false)
			text.unshift(timestamp());
		if (typeof args[0] === 'string') // Check for primary message
			text.push(args.shift());
		fn(text.filter(Boolean).join(' '), ...args);
	};
}

const infoLabel = styleText(['bold', 'cyan'], '[INFO]');
const warnLabel = styleText(['bold', 'yellow'], '[WARN]');
const errorLabel = styleText(['bold', 'red'], '[ERROR]');

export function createLogger(opts?: { scope?: string | Parameters<typeof styleText> }) {
	const scope = opts?.scope;
	let scopeLabel: string;
	if (typeof scope === 'string')
		scopeLabel = styleText('dim', scope);
	else if (Array.isArray(scope))
		scopeLabel = styleText(...scope);
	else if (scope === undefined)
		scopeLabel = '';
	else
		throw new TypeError('Invalid scope');
	return {
		log: wrapMethod(console.log),
		info: wrapMethod(console.info, { addText: [scopeLabel, infoLabel] }),
		warn: wrapMethod(console.warn, { addText: [scopeLabel, warnLabel] }),
		error: wrapMethod(console.error, { addText: [scopeLabel, errorLabel] }),
	};
}

export const logger = createLogger();

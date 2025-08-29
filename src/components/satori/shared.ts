import type { FontOptions } from '@/lib/render';
import type { JSXNode, JSXStyleProperties } from '@/lib/satori';
import { cwd } from 'node:process';

export type { SVGRenderOptions } from '@/lib/render';

export interface Props {
	children?: JSXNode;
	style?: JSXStyleProperties;
}

/**
 * Tailwind `--color-emerald-600` converted to nearest hex value.
 *
 * `bg-emerald-600` used on the metro street sign in the `<Header>` component.
 */
export const COLOR_EMERALD_600_HEX = '#059669';

/**
 * Tailwind `--color-yellow-600` converted to nearest hex value.
 *
 * `text-yellow-600` used on the cardinal direction marker ("N") of the metro street sign in the `<Header>` component.
 */
export const COLOR_YELLOW_600_HEX = '#facc15';

export const fonts = [
	{
		name: 'Overpass',
		style: 'normal',
		weight: 700,
		path: cwd().concat('/public/fonts/overpass/overpass-bold.woff'),
	},
] satisfies FontOptions[];

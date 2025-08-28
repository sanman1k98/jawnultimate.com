import type { FontOptions } from '@/lib/render';
import type { JSXNode, JSXStyleProperties } from '@/lib/satori';
import { cwd } from 'node:process';

export type { SVGRenderOptions } from '@/lib/render';

export interface Props {
	children?: JSXNode;
	style?: JSXStyleProperties;
}

export const fonts = [
	{
		name: 'Overpass',
		style: 'normal',
		weight: 700,
		path: cwd().concat('/public/fonts/overpass/overpass-bold.woff'),
	},
] satisfies FontOptions[];

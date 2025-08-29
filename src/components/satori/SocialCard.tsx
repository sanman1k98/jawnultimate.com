/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import type { Props, SVGRenderOptions } from './shared';
import {
	COLOR_EMERALD_600_HEX,
	COLOR_YELLOW_600_HEX,
	fonts,
} from './shared';

const WIDTH = 1920;
const HEIGHT = WIDTH / 2;

/**
 * Root element with a subtle radial gradient.
 */
function Background(props: Props) {
	return (
		<div
			style={{
				height: HEIGHT,
				width: WIDTH,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				backgroundImage: 'radial-gradient(ellipse, #a7f3d0, white 80%)',
			}}
		>
			{props.children}
		</div>
	);
}

/**
 * Metro sign shape with green background.
 */
function MetroSign(props: Props) {
	// BUG: Satori v0.16.2: clip path only works on square shaped elements.
	const signWidth = 1200;
	const signHeight = signWidth / 3;

	// HACK: use two clip paths for the left and right side of the metro sign.
	const leftShape = 'polygon(60% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40%)';
	const rightShape = 'polygon(0% 0%, 40% 0%, 100% 40%, 100% 100%, 0% 100%)';

	// We are are emulating a 36"x12" Philadephia metro sign, so we can use 3 square elements.
	const squareStyles = {
		height: signHeight,
		width: signHeight,
		position: 'absolute',
		backgroundColor: COLOR_EMERALD_600_HEX,
	} as const;

	return (
		<div
			style={{
				// TODO: set clipPath and backgroundColor on this when bug is fixed.
				display: 'flex',
				position: 'relative', // Default in Satori.
				width: signWidth,
				height: signHeight,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{/* Position the squares next to each other create the whole metro sign shape. */}
			<div style={{ ...squareStyles, left: 0, clipPath: leftShape, borderBottomLeftRadius: '2rem' }} />
			<div style={{ ...squareStyles, left: signHeight }} />
			<div style={{ ...squareStyles, right: 0, clipPath: rightShape, borderBottomRightRadius: '2rem' }} />
			{/* Children will stack on top of the squares. */}
			{props.children}
		</div>
	);
}

/**
 * Metro sign block numbers (1700-1800) with the cardinal direction ("N") between.
 */
function BlockNumbers() {
	return (
		<div
			style={{
				display: 'flex',
				fontSize: '4.5rem',
				alignItems: 'center',
				color: 'white',
				columnGap: '0.5em',
			}}
		>
			<span style={{ transform: 'scale(1.5)' }}>&larr;</span>
			<span>1700</span>
			<span style={{ fontSize: '6rem', color: COLOR_YELLOW_600_HEX }}>N</span>
			<span>1800</span>
			<span style={{ transform: 'scale(1.5)' }}>&rarr;</span>
		</div>
	);
}

/**
 * Metro sign street name ("JAWN").
 */
function StreetName() {
	return (
		<span
			style={{
				display: 'flex',
				fontFamily: 'Overpass',
				fontWeight: 'bold',
				fontSize: '16rem',
				lineHeight: 0.75,
				color: 'white',
				paddingTop: '2rem',
				paddingBottom: '2rem',
			}}
		>
			JAWN
		</span>
	);
}

/**
 * Title text to be shown under the metro sign.
 */
function Title(props: Props) {
	return (
		<span
			style={{
				display: 'flex',
				fontFamily: 'Overpass',
				fontWeight: 'bold',
				fontSize: '10rem',
				color: '#020617',
				letterSpacing: '-0.025em',
				paddingTop: '4rem',
			}}
		>
			{props.children}
		</span>
	);
}

export function SocialCard() {
	return (
		<Background>
			<MetroSign>
				<BlockNumbers />
				<StreetName />
			</MetroSign>
			<Title>
				A Philly frisbee team
			</Title>
		</Background>
	);
}

SocialCard.svgRenderOptions = {
	height: HEIGHT,
	width: WIDTH,
	fonts,
} satisfies SVGRenderOptions;

export default SocialCard;

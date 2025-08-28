/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import type { Props, SVGRenderOptions } from './shared';
import { fonts } from './shared';

const WIDTH = 1920;
const HEIGHT = WIDTH / 2;

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

function MetroSign(props: Props) {
	const signWidth = 1200;
	const signHeight = signWidth / 3;

	// BUG: Satori's clip path only works on square shaped elements.
	const leftShape = 'polygon(60% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40%)';
	const rightShape = 'polygon(0% 0%, 40% 0%, 100% 40%, 100% 100%, 0% 100%)';

	// The metro sign has a 3:1 aspect ratio so we need three squares.
	const squareStyles = {
		height: signHeight,
		width: signHeight,
		position: 'absolute',
		backgroundColor: '#059669',
	} as const;

	return (
		<div
			style={{
				display: 'flex',
				width: signWidth,
				height: signHeight,
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div style={{ ...squareStyles, left: 0, clipPath: leftShape, borderBottomLeftRadius: '2rem' }} />
			<div style={{ ...squareStyles, left: signHeight }} />
			<div style={{ ...squareStyles, right: 0, clipPath: rightShape, borderBottomRightRadius: '2rem' }} />
			{props.children}
		</div>
	);
}

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
			<span style={{ fontSize: '6rem', color: '#facc15' }}>N</span>
			<span>1800</span>
			<span style={{ transform: 'scale(1.5)' }}>&rarr;</span>
		</div>
	);
}

function StreetName(props: Props) {
	return (
		<span
			style={{
				display: 'flex',
				fontFamily: 'Overpass',
				fontWeight: 'bold',
				fontSize: '16rem',
				lineHeight: 0.75,
				// letterSpacing: '-0.05em',
				color: 'white',
				paddingTop: '2rem',
				paddingBottom: '2rem',
			}}
		>
			{props.children}
		</span>
	);
}

function Subtitle(props: Props) {
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
				<StreetName>JAWN</StreetName>
			</MetroSign>
			<Subtitle>
				A Philly frisbee team
			</Subtitle>
		</Background>
	);
}

SocialCard.svgRenderOptions = {
	height: HEIGHT,
	width: WIDTH,
	fonts,
} satisfies SVGRenderOptions;

export default SocialCard;

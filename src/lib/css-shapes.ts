/**
 * @file
 * CSS basic shape values.
 */

const percent = (x: number) => `${(100 * x).toFixed(2)}%`;

let metroStreetSign: string;

{
	const leftSide = [
		'0% 100%', // Bottom left.
		`0% ${percent(5 / 12)}`,
	];

	const topSide = [
		`${percent(8 / 36)} 0%`,
		`${percent((36 - 8) / 36)} 0%`,
	];

	const rightSide = [
		`100% ${percent(5 / 12)}`,
		'100% 100%', // Bottom right.
	];

	// Each coordinate represents a vertex of the shape.
	// Coordinates are going clockwise around the shape.
	const coords = leftSide.concat(topSide).concat(rightSide);
	metroStreetSign = `polygon(${coords.join(', ')})`;
}

/**
 * A 36"x12" Philadelphia metro street sign shape.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/polygon CSS `polygon()` function}
 * @see {@link https://www.phila.gov/media/20210622095341/Streets-standards-SN0101-metro-street-name-20161024.pdf Metro Sign Standards}
 */
export const METRO_STREET_SIGN = metroStreetSign;

let metroStreetSignLeftShape: string;
let metroStreetSignRightShape: string;

{ // HACK: create clip path for a square element for the left side shape of the metro street sign.
	const leftSide = [
		'0% 100%', // Bottom left.
		`0% ${percent(5 / 12)}`,
	];

	const topSide = [
		`${percent(8 / 12)} 0%`,
		'100% 0%', // Top right.
	];

	const bottomRight = [
		'100% 100%', // Bottom right.
	];

	const coords = leftSide.concat(topSide).concat(bottomRight);
	metroStreetSignLeftShape = `polygon(${coords.join(', ')})`;
}

{ // HACK: create clip path for a square element for the right side shape of the metro street sign.
	const bottomLeft = [
		'0% 100%', // Bottom left.
	];

	const topSide = [
		'0% 0%', // Top left.
		`${percent((12 - 8) / 12)} 0%`,
	];

	const rightSide = [
		`100% ${percent(5 / 12)}`,
		'100% 100%', // Bottom right.
	];

	const coords = bottomLeft.concat(topSide).concat(rightSide);
	metroStreetSignRightShape = `polygon(${coords.join(', ')})`;
}

/**
 * HACK: In Satori v0.18.1, `clip-path` only works correctly on square elements.
 */
export const SATORI_SQUARE_ELEMENT_CLIP_PATHS = {
	METRO_STREET_SIGN_LEFT_SHAPE: metroStreetSignLeftShape,
	METRO_STREET_SIGN_RIGHT_SHAPE: metroStreetSignRightShape,
};

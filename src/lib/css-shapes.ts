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
		`${percent(28 / 36)} 0%`,
	];

	const rightSide = [
		`100% ${percent(5 / 12)}`,
		'100% 100%', // Bottom right.
	];

	// Each coordinate represents a vertex of the shape.
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

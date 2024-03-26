export type Flag = {
	name: string;
	image: string;
	landmass: 'North America' | 'South America' | 'Europe' | 'Africa' | 'Asia' | 'Oceania';
	zone: 'NE' | 'SE' | 'SW' | 'NW'; // Geographic quadrant, based on Greenwich and the Equator
	area: number; // in thousands of km2
	population: number; // in round millions
	language:
		| 'English'
		| 'Spanish'
		| 'French'
		| 'German'
		| 'Slavic'
		| 'Other Indo-European'
		| 'Chinese'
		| 'Arabic'
		| 'Japanese/Turkish/Finnish/Magyar'
		| 'Others';
	religion:
		| 'Catholic'
		| 'Other Christian'
		| 'Muslim'
		| 'Buddhist'
		| 'Hindu'
		| 'Ethnic'
		| 'Marxist'
		| 'Others';
	bars: number; // Number of vertical bars in the flag
	stripes: number; // Number of horizontal stripes in the flag
	colours: number; // Number of different colours in the flag
	red: boolean; // 0 if red absent, 1 if red present in the flag
	green: boolean; // idem
	blue: boolean; // idem
	gold: boolean; // idem
	white: boolean; // idem
	black: boolean; // idem
	orange: boolean; // idem
	mainhue: string; // predominant colour in the flag (tie-breaks decided by taking the topmost hue, if that fails then the most central hue, and if that fails the leftmost hue)
	circles: number; // Number of circles in the flag
	crosses: number; // Number of (upright) crosses
	saltires: number; // Number of diagonal crosses
	quarters: number; // Number of quartered sections
	sunstars: number; // Number of sun or star symbols
	crescent: boolean; // 1 if a crescent moon symbol present, else 0
	triangle: boolean; // 1 if any triangles present, 0 otherwise
	icon: boolean; // 1 if an inanimate image present (e.g., a boat), otherwise 0
	animate: boolean; // 1 if an animate image (e.g., an eagle, a tree, a human hand) present, 0 otherwise
	text: boolean; // 1 if any letters or writing on the flag (e.g., a motto or slogan), 0 otherwise
	topleft: string; // Colour in the top-left corner (moving right to decide tie-breaks)
	botright: string; // Colour in the bottom-left corner (moving left to decide tie-breaks)
};

import hello from '$lib/flags.txt';
import { read } from '$app/server';
import type { Flag } from '../types';

export const loadFlags = async () => {
	return await read(hello).text();
};

export function parseFlagCSV(csvData: string): Flag[] {
	const lines = csvData.split('\n');
	console.log(lines[0]);
	const header = lines[0].trim().split(';');
	const flags: Flag[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].trim().split(';');
		if (values.length !== header.length) {
			// Skip lines with invalid data
			continue;
		}

		flags.push({
			name: values[0].trim(),
			image: values[1].trim(),
			landmass: parseLandmass(values[2].trim()),
			zone: parseZone(values[3].trim()),
			area: +values[4].trim(),
			population: +values[5].trim(),
			language: parseLanguage(values[6].trim()),
			religion: parseReligion(values[7].trim()),
			bars: +values[8].trim(),
			stripes: +values[9].trim(),
			colours: +values[10].trim(),
			red: Boolean(values[11].trim()),
			green: Boolean(values[12].trim()),
			blue: Boolean(values[13].trim()),
			gold: Boolean(values[14].trim()),
			white: Boolean(values[15].trim()),
			black: Boolean(values[16].trim()),
			orange: Boolean(values[17].trim()),
			mainhue: values[18].trim(),
			circles: +values[19].trim(),
			crosses: +values[20].trim(),
			saltires: +values[21].trim(),
			quarters: +values[22].trim(),
			sunstars: +values[23].trim(),
			crescent: Boolean(values[24].trim()),
			triangle: Boolean(values[25].trim()),
			icon: Boolean(values[26].trim()),
			animate: Boolean(values[27].trim()),
			text: Boolean(values[28].trim()),
			topleft: values[29].trim(),
			botright: values[30].trim()
		});
	}

	return flags;
}

const parseLandmass = (landmass: string): Flag['landmass'] => {
	switch (landmass) {
		case '1':
			return 'North America';
		case '2':
			return 'South America';
		case '3':
			return 'Europe';
		case '4':
			return 'Africa';
		case '5':
			return 'Asia';
		case '6':
			return 'Oceania';
		default:
			return 'North America';
	}
};

const parseZone = (zone: string): Flag['zone'] => {
	switch (zone) {
		case '1':
			return 'NE';
		case '2':
			return 'SE';
		case '3':
			return 'SW';
		case '4':
			return 'NW';
		default:
			return 'NE';
	}
};

const parseLanguage = (language: string): Flag['language'] => {
	switch (language) {
		case '1':
			return 'English';
		case '2':
			return 'Spanish';
		case '3':
			return 'French';
		case '4':
			return 'German';
		case '5':
			return 'Slavic';
		case '6':
			return 'Other Indo-European';
		case '7':
			return 'Chinese';
		case '8':
			return 'Arabic';
		case '9':
			return 'Japanese/Turkish/Finnish/Magyar';
		case '10':
			return 'Others';
		default:
			return 'English';
	}
};

const parseReligion = (religion: string): Flag['religion'] => {
	switch (religion) {
		case '0':
			return 'Catholic';
		case '1':
			return 'Other Christian';
		case '2':
			return 'Muslim';
		case '3':
			return 'Buddhist';
		case '4':
			return 'Hindu';
		case '5':
			return 'Ethnic';
		case '6':
			return 'Marxist';
		case '7':
			return 'Others';
		default:
			return 'Catholic';
	}
};

import hello from '$lib/flags.txt';
import { read } from '$app/server';

export const loadFlags = async () => {
	return await read(hello).text();
};

export const parseCsvFlags = async (rawCsvText: string): Promise<Flag[]> => {
	const flags: Flag[] = [];
	let count = 0;
	for (const line of rawCsvText.split('\n')) {
		// First line is the header column, so ignore it
		if (count === 0) {
			count++;
			continue;
		}

		const columns = line.split(';');
		console.log(columns);
		const flag: Flag = {
			name: columns[0],
			image: columns[1],
			landmass: columns[2],
			zone: columns[3],
			area: columns[4],
			population: columns[5],
			language: columns[6],
			religion: columns[7],
			bars: columns[8],
			stripes: columns[9],
			colours: columns[10],
			red: columns[11],
			green: columns[12],
			blue: columns[13],
			gold: columns[14],
			white: columns[15],
			black: columns[16],
			orange: columns[17],
			mainhue: columns[18],
			circles: columns[19],
			crosses: columns[20],
			saltires: columns[21],
			quarters: columns[22],
			sunstars: columns[23],
			crescent: columns[24],
			triangle: columns[25],
			icon: columns[26],
			animate: columns[27],
			text: columns[28],
			topleft: columns[29],
			botright: columns[30]
		};
		flags.push(flag);
		count++;
	}

	return flags;
};

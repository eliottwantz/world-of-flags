import hello from '$lib/flags.txt';
import { read } from '$app/server';

export const loadFlags = async () => {
	const readRes = read(hello);
	const data = await readRes.text();

	console.log(data);
};

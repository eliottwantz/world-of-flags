import { loadFlags, parseFlagCSV } from '$lib';

export const load = async () => {
	const flags = parseFlagCSV(await loadFlags());
	return {
		flags
	};
};

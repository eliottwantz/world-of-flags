import { loadFlags, parseCsvFlags } from '$lib';

export const load = async () => {
	const flags = await parseCsvFlags(await loadFlags());
	return {
		flags
	};
};

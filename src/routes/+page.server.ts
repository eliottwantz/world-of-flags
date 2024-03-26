import { loadFlags } from '$lib';

export const load = async () => {
	const flags = await loadFlags();
	return {
		flags
	};
};

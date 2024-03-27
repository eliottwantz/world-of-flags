import { flagCodes } from '$lib';

export const load = async () => {
	const flags = flagCodes;
	return {
		flags
	};
};

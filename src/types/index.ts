type FlagCode = Record<string, string>;

type Flag = {
	name: string;
	normalized: string;
	code: string;
};
type Question = {
	answer: Flag;
	choices: string[];
};

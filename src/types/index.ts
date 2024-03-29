type FlagCode = Record<string, string>;

type Flag = {
	name: string;
	code: string;
};
type Question = {
	answer: Flag;
	choices: string[];
};

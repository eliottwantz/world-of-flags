import flagCodesData from '$lib/codes/fr.json';

export const flagCodes = flagCodesData;

function shuffleArray<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function generateQuestions(): Question[] {
	const countryFlags: [string, string][] = Object.entries(flagCodes);
	const questions: Question[] = [];

	shuffleArray(countryFlags);

	for (const [countryCode, countryName] of countryFlags) {
		const choices: string[] = [countryName]; // Correct choice
		while (choices.length < 6) {
			const randomCountryIndex = Math.floor(Math.random() * countryFlags.length);
			const [randomCountryCode, randomCountryName] = countryFlags[randomCountryIndex];

			if (!choices.includes(randomCountryName) && randomCountryCode !== countryCode) {
				choices.push(randomCountryName);
			}
		}
		shuffleArray(choices);

		questions.push({
			answer: {
				name: countryName,
				code: countryCode
			},
			choices
		});
	}
	return questions;
}

export const getQuestions = () => {
	let questions: Question[];

	if (localStorage.getItem('questions') !== null) {
		questions = JSON.parse(localStorage.getItem('questions')!);
	} else {
		questions = generateQuestions();
	}

	return questions;
};

export const getCurrentQuestion = () => {
	let current = 0;

	if (localStorage.getItem('current') !== null) {
		current = Number(localStorage.getItem('current'));
	}

	return current;
};

export const getScore = () => {
	let score = 0;

	if (localStorage.getItem('score') !== null) {
		score = Number(localStorage.getItem('score'));
	}

	return score;
};

export const setScore = (score: number) => {
	localStorage.setItem('score', score.toString());
};

export class Game {
	questions: Question[] = getQuestions();
	current = getCurrentQuestion();
	score = getScore();

	// get current question
	getCurrentQuestion() {
		return this.questions[this.current];
	}

	// get next question
	getNextQuestion() {
		this.current++;
		localStorage.setItem('current', this.current.toString());
		return this.questions[this.current];
	}

	// check answer
	checkAnswer(answer: Flag) {
		if (this.questions[this.current].answer.code === answer.code) {
			this.score++;
			setScore(this.score);
		}
	}

	// get score
	getScore() {
		return this.score;
	}

	// reset game
	resetGame() {
		this.current = 0;
		this.score = 0;
		localStorage.setItem('current', this.current.toString());
		localStorage.setItem('score', this.score.toString());
	}
}

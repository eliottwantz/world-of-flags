import flagCodesData from '$lib/codes/fr.json';

export const flagCodes = flagCodesData;

function shuffleArray<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export class Game {
	#storageKey = 'game';

	current: number = $state(0);
	questions: Question[] = $state<Question[]>([]);
	right: Question[] = $state<Question[]>([]);
	wrong: Question[] = $state<Question[]>([]);
	score: number = $derived(this.right.length);

	constructor() {
		const gameStr = localStorage.getItem('game');
		if (gameStr !== null) {
			const game = JSON.parse(gameStr) as Game;
			this.questions = game.questions;
			this.current = game.current;
			this.right = game.right;
			this.wrong = game.wrong;
			this.score = game.score;
		} else {
			this.resetGame();
			this.#generateQuestions();
		}
	}

	get currentQuestion() {
		return this.questions[this.current];
	}

	#generateQuestions() {
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

	#saveState() {
		localStorage.setItem('game', JSON.stringify(this));
	}

	resetGame() {
		this.current = 0;
		this.questions = [];
		this.right = [];
		this.wrong = [];

		localStorage.setItem(this.#storageKey, JSON.stringify(this));
	}

	selectAnswer(answer: Flag) {
		if (answer.code === this.currentQuestion.answer.code) {
			this.right.push(this.currentQuestion);
			this.#saveState();
		} else {
			this.wrong.push(this.currentQuestion);
			this.#saveState();
		}

		this.current++;
	}
}

export const game = new Game();

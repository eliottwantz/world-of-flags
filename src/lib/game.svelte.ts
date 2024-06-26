import flagCodesData from '$lib/codes/fr.json';

function shuffleArray<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

const normalize = (input: string): string => {
	return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

type GameMode = 'multiple-choice' | 'exact-match';

export class Game {
	#storageKey = 'game';

	mode: GameMode;
	current: number = $state(0);
	questions: Question[] = $state<Question[]>([]);
	right: Question[] = $state<Question[]>([]);
	wrong: Question[] = $state<Question[]>([]);
	countryNames: string[] = $state<string[]>([]);
	countryNamesNormalized: string[] = $state<string[]>([]);

	constructor(mode: GameMode = 'multiple-choice') {
		this.mode = mode;
		this.countryNames = Object.values(flagCodesData);
		this.countryNamesNormalized = Object.values(flagCodesData).map(normalize);

		const fromStorage = localStorage.getItem(this.#storageKey);
		if (fromStorage) {
			const [mode, questions, current, right, wrong] = fromStorage.split('|');
			if (!mode || !questions || !current || !right || !wrong) {
				console.log('Bad game state, need to reset');
				this.reset();
				return;
			}

			console.log('Game state loaded from local storage');

			this.mode = mode as GameMode;
			this.questions = JSON.parse(questions);
			this.current = parseInt(current);
			this.right = JSON.parse(right);
			this.wrong = JSON.parse(wrong);
		} else {
			this.reset();
		}
	}

	get currentQuestion() {
		return this.questions[this.current];
	}

	#generateQuestions() {
		const countryFlags: [string, string][] = Object.entries(flagCodesData);
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
					normalized: normalize(countryName).toLowerCase(),
					code: countryCode
				},
				choices
			});
		}
		return questions;
	}

	#saveState() {
		localStorage.setItem('game', this.toString());
	}

	toString() {
		return `${this.mode}|${JSON.stringify(this.questions)}|${this.current}|${JSON.stringify(this.right)}|${JSON.stringify(this.wrong)}`;
	}

	reset(mode: 'incorrect-only' | 'default' = 'default') {
		if (mode === 'incorrect-only') {
			this.current = 0;
			this.questions = this.wrong;
			this.right = [];
			this.wrong = [];
		} else {
			this.current = 0;
			this.questions = this.#generateQuestions();
			this.right = [];
			this.wrong = [];
		}

		this.#saveState();
	}

	startNew(mode: GameMode) {
		this.mode = mode;
		this.reset();
	}

	selectAnswer(answer: string) {
		if (normalize(answer.trim().toLowerCase()) === this.currentQuestion.answer.normalized) {
			this.right.push(this.currentQuestion);
		} else {
			this.wrong.push(this.currentQuestion);
		}
	}

	nextQuestion() {
		this.current++;
		this.#saveState();
	}
}

export const game = new Game();

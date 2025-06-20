export type Language = "en" | "fr";

export interface Country {
	name: {
		common: string;
		official: string;
	};
	translations?: {
		fra?: {
			official: string;
			common: string;
		};
	};
	flags: {
		png: string;
		svg: string;
	};
	cca2: string;
	cca3: string;
}

export interface GameQuestion {
	country: Country;
	options: Country[];
	correctAnswer: string;
}

export interface GameState {
	currentQuestion: number;
	score: number;
	questions: GameQuestion[];
	startTime: number;
	isGameComplete: boolean;
	lastAnswerCorrect: boolean | null;
	showResult: boolean;
}

export interface GameStats {
	id?: number;
	score: number;
	totalQuestions: number;
	accuracy: number;
	timeTaken: number;
	completedAt: string;
	isWin: boolean;
}

export interface StatsData {
	recentGames: GameStats[];
	aggregates: {
		totalGames: number;
		totalWins: number;
		winRate: number;
		averageScore: number;
		averageAccuracy: number;
		averageTime: number;
		bestScore: number;
		bestAccuracy: number;
		fastestTime: number;
	};
}

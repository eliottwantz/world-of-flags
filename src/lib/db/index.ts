import Dexie, { type EntityTable } from "dexie";

export interface GameStat {
	id?: number;
	score: number;
	totalQuestions: number;
	accuracy: number;
	timeTaken: number; // in seconds
	completedAt: string;
	isWin: boolean;
}

const db = new Dexie("FlagGameDB") as Dexie & {
	gameStats: EntityTable<GameStat, "id">;
};

// Schema
db.version(1).stores({
	gameStats:
		"++id, score, totalQuestions, accuracy, timeTaken, completedAt, isWin",
});

export type { GameStat as GameStatType };
export { db };

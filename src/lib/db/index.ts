import Dexie, { type Table } from 'dexie';
import type { GameStats } from '$lib/types';

export class WorldOfFlagsDB extends Dexie {
	gameStats!: Table<GameStats>;

	constructor() {
		super('WorldOfFlagsDB');
		this.version(1).stores({
			gameStats: '++id, score, totalQuestions, accuracy, timeTaken, completedAt, isWin'
		});
	}
}

export const db = new WorldOfFlagsDB();
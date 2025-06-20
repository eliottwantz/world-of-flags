import { type GameStatType, db } from "./index";

/**
 * Save a new game stat to the database
 */
export async function saveGameStat(
	data: Omit<GameStatType, "id">,
): Promise<GameStatType> {
	const id = await db.gameStats.add(data);
	const savedStat = await db.gameStats.get(id);
	if (!savedStat) {
		throw new Error("Failed to save game stat");
	}
	return savedStat;
}

/**
 * Get all game stats ordered by completion date (newest first)
 */
export async function getAllGameStats(): Promise<GameStatType[]> {
	return await db.gameStats.orderBy("completedAt").reverse().toArray();
}

/**
 * Get recent game stats (limit 10)
 */
export async function getRecentGameStats(limit = 10): Promise<GameStatType[]> {
	return await db.gameStats
		.orderBy("completedAt")
		.reverse()
		.limit(limit)
		.toArray();
}

/**
 * Get aggregate statistics
 */
export async function getAggregateStats() {
	const allStats = await getAllGameStats();

	const totalGames = allStats.length;
	const totalWins = allStats.filter((stat) => stat.isWin).length;
	const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

	const averageScore =
		totalGames > 0
			? allStats.reduce((sum, stat) => sum + stat.score, 0) / totalGames
			: 0;

	const averageAccuracy =
		totalGames > 0
			? allStats.reduce((sum, stat) => sum + stat.accuracy, 0) / totalGames
			: 0;

	const averageTime =
		totalGames > 0
			? allStats.reduce((sum, stat) => sum + stat.timeTaken, 0) / totalGames
			: 0;

	const bestScore =
		allStats.length > 0 ? Math.max(...allStats.map((s) => s.score)) : 0;

	const bestAccuracy =
		allStats.length > 0 ? Math.max(...allStats.map((s) => s.accuracy)) : 0;

	const fastestTime =
		allStats.length > 0 ? Math.min(...allStats.map((s) => s.timeTaken)) : 0;

	return {
		totalGames,
		totalWins,
		winRate,
		averageScore,
		averageAccuracy,
		averageTime,
		bestScore,
		bestAccuracy,
		fastestTime,
	};
}

/**
 * Delete all game stats (for testing purposes)
 */
export async function clearAllStats(): Promise<void> {
	await db.gameStats.clear();
}

/**
 * Get stats data in the format expected by the UI
 */
export async function getStatsData() {
	const [recentGames, aggregates] = await Promise.all([
		getRecentGameStats(),
		getAggregateStats(),
	]);

	return {
		recentGames,
		aggregates,
	};
}

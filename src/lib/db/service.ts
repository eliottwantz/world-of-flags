import { db } from '$lib/db';
import type { GameState, GameStats, StatsData } from '$lib/types';

export const saveGameStats = async (gameState: GameState) => {
	const { score, questions, startTime } = gameState;
	const totalQuestions = questions.length;
	const accuracy = (score / totalQuestions) * 100;
	const timeTaken = (Date.now() - startTime) / 1000;
	const completedAt = new Date().toISOString();
	const isWin = score > totalQuestions / 2;

	await db.gameStats.add({
		score,
		totalQuestions,
		accuracy,
		timeTaken,
		completedAt,
		isWin
	});
};

export const getStatsData = async (): Promise<StatsData> => {
	const recentGames = await db.gameStats.orderBy('completedAt').reverse().toArray();
	const totalGames = recentGames.length;

	if (totalGames === 0) {
		return {
			recentGames: [],
			aggregates: {
				totalGames: 0,
				totalWins: 0,
				winRate: 0,
				averageScore: 0,
				averageAccuracy: 0,
				averageTime: 0,
				bestScore: 0,
				bestAccuracy: 0,
				fastestTime: 0
			}
		};
	}

	const totalWins = recentGames.filter((game) => game.isWin).length;
	const winRate = (totalWins / totalGames) * 100;

	const totalScore = recentGames.reduce((sum, game) => sum + game.score, 0);
	const averageScore = totalScore / totalGames;

	const totalAccuracy = recentGames.reduce((sum, game) => sum + game.accuracy, 0);
	const averageAccuracy = totalAccuracy / totalGames;

	const totalTime = recentGames.reduce((sum, game) => sum + game.timeTaken, 0);
	const averageTime = totalTime / totalGames;

	const bestScore = Math.max(...recentGames.map((game) => game.score));
	const bestAccuracy = Math.max(...recentGames.map((game) => game.accuracy));
	const fastestTime = Math.min(...recentGames.map((game) => game.timeTaken));

	return {
		recentGames,
		aggregates: {
			totalGames,
			totalWins,
			winRate,
			averageScore,
			averageAccuracy,
			averageTime,
			bestScore,
			bestAccuracy,
			fastestTime
		}
	};
};

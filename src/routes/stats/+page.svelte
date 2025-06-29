<script lang="ts">
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { getStatsData } from '$lib/db/service';
	import type { StatsData } from '$lib/types';

	let statsData = $state<StatsData | null>(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			statsData = await getStatsData();
		} catch (err) {
			error = 'Failed to load statistics';
			console.error(err);
		} finally {
			loading = false;
		}
	});

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Calculate chart data for recent performance
	let recentPerformance = $derived(
		statsData?.recentGames
			.slice(0, 10)
			.reverse()
			.map((game, index) => ({
				game: index + 1,
				score: game.score,
				accuracy: game.accuracy
			})) || []
	);
</script>

<svelte:head>
	<title>World of Flags - Statistics</title>
</svelte:head>

<div class="min-h-dvh px-4 py-8">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class="mb-8 text-center" in:fade={{ duration: 300 }}>
			<h1 class="mb-4 text-4xl font-bold text-gray-900">📊 Your Statistics</h1>
			<a
				href="/"
				class="inline-flex items-center font-medium text-yellow-600 transition-colors duration-150 hover:text-yellow-800"
			>
				← Back to Game
			</a>
		</div>

		{#if loading}
			<div class="text-center" in:fade={{ duration: 200 }}>
				<div
					class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-yellow-600"
				></div>
				<p class="text-lg text-gray-600">Loading statistics...</p>
			</div>
		{:else if error}
			<div class="text-center text-red-600" in:fade={{ duration: 300 }}>
				<p class="text-lg">{error}</p>
			</div>
		{:else if statsData}
			<!-- Overview Cards -->
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{#each [{ label: 'Total Games', value: statsData.aggregates.totalGames, icon: '🎮', color: 'blue' }, { label: 'Win Rate', value: `${Math.round(statsData.aggregates.winRate)}%`, icon: '🏆', color: 'green' }, { label: 'Best Score', value: `${statsData.aggregates.bestScore}/10`, icon: '⭐', color: 'yellow' }, { label: 'Best Accuracy', value: `${Math.round(statsData.aggregates.bestAccuracy)}%`, icon: '🎯', color: 'purple' }] as stat, index}
					<div
						class="transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
						in:fly={{ y: 50, duration: 500, delay: index * 100, easing: quintOut }}
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="mb-1 text-sm font-medium text-gray-500">{stat.label}</p>
								<p class="text-2xl font-bold text-gray-900">{stat.value}</p>
							</div>
							<div class="text-3xl">{stat.icon}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Performance Chart -->
			{#if recentPerformance.length > 0}
				<div
					class="mb-8 rounded-xl bg-white p-6 shadow-lg"
					in:fly={{ y: 50, duration: 500, delay: 400, easing: quintOut }}
				>
					<h2 class="mb-6 text-xl font-bold text-gray-900">Recent Performance</h2>
					<div class="relative h-64">
						<svg class="h-full w-full" viewBox="0 0 400 200">
							<!-- Grid lines -->
							{#each [0, 25, 50, 75, 100] as y}
								<line
									x1="40"
									y1={160 - y * 1.2}
									x2="380"
									y2={160 - y * 1.2}
									stroke="#e5e7eb"
									stroke-width="1"
								/>
								<text x="35" y={165 - y * 1.2} text-anchor="end" class="fill-gray-500 text-xs">
									{y}%
								</text>
							{/each}

							<!-- Accuracy line -->
							{#if recentPerformance.length > 1}
								<polyline
									points={recentPerformance
										.map(
											(point, i) =>
												`${50 + (i * 300) / (recentPerformance.length - 1)},${160 - point.accuracy * 1.2}`
										)
										.join(' ')}
									fill="none"
									stroke="#eab308"
									stroke-width="3"
									class="drop-shadow-sm"
								/>
							{/if}

							<!-- Score bars -->
							{#each recentPerformance as point, i}
								<rect
									x={45 + (i * 300) / Math.max(recentPerformance.length - 1, 1) - 8}
									y={160 - point.score * 16}
									width="16"
									height={point.score * 16}
									fill="#10b981"
									rx="2"
									class="opacity-70"
								/>

								<!-- Accuracy points -->
								<circle
									cx={50 + (i * 300) / Math.max(recentPerformance.length - 1, 1)}
									cy={160 - point.accuracy * 1.2}
									r="4"
									fill="#eab308"
									class="drop-shadow-sm"
								/>
							{/each}
						</svg>

						<!-- Legend -->
						<div class="flex justify-center space-x-6">
							<div class="flex items-center">
								<div class="mr-2 h-4 w-4 rounded bg-green-500 opacity-70"></div>
								<span class="text-sm text-gray-600">Score</span>
							</div>
							<div class="flex items-center">
								<div class="mr-2 h-4 w-4 rounded-full bg-yellow-500"></div>
								<span class="text-sm text-gray-600">Accuracy</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Detailed Stats -->
			<div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- Average Performance -->
				<div
					class="rounded-xl bg-white p-6 shadow-lg"
					in:fly={{ y: 50, duration: 500, delay: 500, easing: quintOut }}
				>
					<h2 class="mb-6 text-xl font-bold text-gray-900">Average Performance</h2>
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-gray-600">Average Score</span>
							<span class="font-semibold"
								>{Math.round(statsData.aggregates.averageScore * 10) / 10}/10</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-gray-600">Average Accuracy</span>
							<span class="font-semibold">{Math.round(statsData.aggregates.averageAccuracy)}%</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-gray-600">Average Time</span>
							<span class="font-semibold"
								>{formatTime(Math.round(statsData.aggregates.averageTime))}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-gray-600">Fastest Time</span>
							<span class="font-semibold text-green-600"
								>{formatTime(statsData.aggregates.fastestTime)}</span
							>
						</div>
					</div>
				</div>

				<!-- Win/Loss Breakdown -->
				<div
					class="rounded-xl bg-white p-6 shadow-lg"
					in:fly={{ y: 50, duration: 500, delay: 600, easing: quintOut }}
				>
					<h2 class="mb-6 text-xl font-bold text-gray-900">Win/Loss Breakdown</h2>
					<div class="relative">
						<!-- Donut Chart -->
						<svg class="mx-auto mb-4 h-32 w-32" viewBox="0 0 100 100">
							{#if statsData.aggregates.totalGames > 0}
								{@const winPercentage = statsData.aggregates.winRate}
								{@const winAngle = (winPercentage / 100) * 360}
								{@const lossAngle = 360 - winAngle}

								<!-- Win arc -->
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="#10b981"
									stroke-width="20"
									stroke-dasharray={`${winAngle * 0.628} 251.2`}
									transform="rotate(-90 50 50)"
								/>

								<!-- Loss arc -->
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="#ef4444"
									stroke-width="20"
									stroke-dasharray={`${lossAngle * 0.628} 251.2`}
									stroke-dashoffset={`-${winAngle * 0.628}`}
									transform="rotate(-90 50 50)"
								/>
							{:else}
								<circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="20" />
							{/if}
						</svg>

						<div class="text-center">
							<div class="flex justify-center space-x-4 text-sm">
								<div class="flex items-center">
									<div class="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
									<span>Wins: {statsData.aggregates.totalWins}</span>
								</div>
								<div class="flex items-center">
									<div class="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
									<span
										>Losses: {statsData.aggregates.totalGames -
											statsData.aggregates.totalWins}</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Recent Games -->
			{#if statsData.recentGames.length > 0}
				<div
					class="rounded-xl bg-white p-6 shadow-lg"
					in:fly={{ y: 50, duration: 500, delay: 700, easing: quintOut }}
				>
					<h2 class="mb-6 text-xl font-bold text-gray-900">Recent Games</h2>
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="border-b border-gray-200">
									<th class="px-4 py-3 text-left font-medium text-gray-600">Date</th>
									<th class="px-4 py-3 text-left font-medium text-gray-600">Score</th>
									<th class="px-4 py-3 text-left font-medium text-gray-600">Accuracy</th>
									<th class="px-4 py-3 text-left font-medium text-gray-600">Time</th>
									<th class="px-4 py-3 text-left font-medium text-gray-600">Result</th>
								</tr>
							</thead>
							<tbody>
								{#each statsData.recentGames as game, index}
									<tr
										class="border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50"
										in:fly={{ x: -50, duration: 300, delay: index * 50, easing: quintOut }}
									>
										<td class="px-4 py-3 text-sm text-gray-600">{formatDate(game.completedAt)}</td>
										<td class="px-4 py-3 text-sm font-medium">{game.score}/10</td>
										<td class="px-4 py-3 text-sm">{Math.round(game.accuracy)}%</td>
										<td class="px-4 py-3 text-sm">{formatTime(game.timeTaken)}</td>
										<td class="px-4 py-3">
											{#if game.isWin}
												<span
													class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
												>
													🏆 Win
												</span>
											{:else}
												<span
													class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
												>
													📚 Loss
												</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else}
				<div class="py-12 text-center" in:fade={{ duration: 500, delay: 700 }}>
					<div class="mb-4 text-6xl">🎮</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900">No games played yet</h3>
					<p class="mb-6 text-gray-600">Start playing to see your statistics!</p>
					<a
						href="/"
						class="inline-block transform rounded-lg bg-yellow-500 px-6 py-3 font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-yellow-600"
					>
						Play Your First Game
					</a>
				</div>
			{/if}
		{/if}
	</div>
</div>

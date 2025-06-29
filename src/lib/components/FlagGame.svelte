<script lang="ts">
	import { fetchCountries, generateGameQuestions, getCountryName } from '$lib/api';
	import type { Country, GameState, Language } from '$lib/types';
	import { saveGameStats } from '$lib/db/service';
	import { onMount } from 'svelte';
	import { backOut, quintOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';

	const GAME_STATE_KEY = 'gameState';

	let gameState = $state<GameState>({
		currentQuestion: 0,
		score: 0,
		questions: [],
		startTime: 0,
		isGameComplete: false,
		lastAnswerCorrect: null,
		showResult: false
	});

	let countries = $state<Country[]>([]);
	let loading = $state(true);
	let selectedAnswer = $state('');
	let showingResult = $state(false);
	let gameStarted = $state(false);
	let selectedLanguage = $state<Language>('fr');

	onMount(async () => {
		try {
			const savedState = localStorage.getItem(GAME_STATE_KEY);
			if (savedState) {
				gameState = JSON.parse(savedState);
				gameStarted = true;
			}
		} catch (error) {
			console.error('Failed to load saved game state:', error);
			localStorage.removeItem(GAME_STATE_KEY);
		}

		try {
			countries = await fetchCountries();
			loading = false;
		} catch (error) {
			console.error('Failed to load countries:', error);
			loading = false;
		}
	});

	$effect(() => {
		if (gameStarted && !gameState.isGameComplete) {
			try {
				localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
			} catch (error) {
				console.error('Failed to save game state:', error);
			}
		}
	});

	function startGame() {
		gameState = {
			currentQuestion: 0,
			score: 0,
			questions: generateGameQuestions(countries, countries.length, selectedLanguage),
			startTime: Date.now(),
			isGameComplete: false,
			lastAnswerCorrect: null,
			showResult: false
		};
		gameStarted = true;
		selectedAnswer = '';
		showingResult = false;
	}

	function selectAnswer(countryName: string) {
		if (showingResult) return;

		selectedAnswer = countryName;
		const isCorrect = countryName === gameState.questions[gameState.currentQuestion].correctAnswer;

		gameState.lastAnswerCorrect = isCorrect;
		if (isCorrect) {
			gameState.score++;
		}

		showingResult = true;

		setTimeout(() => {
			nextQuestion();
		}, 1000);
	}

	function nextQuestion() {
		if (gameState.currentQuestion < gameState.questions.length - 1) {
			gameState.currentQuestion++;
			selectedAnswer = '';
			showingResult = false;
			gameState.lastAnswerCorrect = null;
		} else {
			endGame();
		}
	}

	async function endGame() {
		gameState.isGameComplete = true;
		await saveGameStats(gameState);
		localStorage.removeItem(GAME_STATE_KEY);
	}

	function restartGame() {
		gameStarted = false;
		gameState.isGameComplete = false;
		localStorage.removeItem(GAME_STATE_KEY);
	}

	let currentQuestion = $derived(gameState.questions[gameState.currentQuestion]);
	let progress = $derived(((gameState.currentQuestion + 1) / gameState.questions.length) * 100);
</script>

<div
	class="flex h-full w-full max-w-full mx-auto items-center justify-center p-4"
>
	{#if loading}
		<div class="text-center" in:fade={{ duration: 200 }}>
			<div
				class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-yellow-600"
			></div>
			<p class="text-lg text-gray-600">Loading countries...</p>
		</div>
	{:else if !gameStarted}
		<div class="text-center" in:scale={{ duration: 300, easing: backOut }}>
			<h1 class="mb-6 text-4xl font-bold text-gray-900">🌎 World of Flags 🌍</h1>
			<p class="mb-8 text-lg text-gray-600">
				Test your knowledge of world flags! Identify country flags and become a Flag Master.
			</p>

			<!-- Language Selector -->
			<div class="mb-8">
				<div class="flex justify-center space-x-4">
					<button
						onclick={() => (selectedLanguage = 'fr')}
						class="flex items-center space-x-2 rounded-lg px-4 py-2 font-medium transition-all duration-150"
						class:bg-yellow-500={selectedLanguage === 'fr'}
						class:text-white={selectedLanguage === 'fr'}
						class:shadow-md={selectedLanguage === 'fr'}
						class:bg-gray-200={selectedLanguage !== 'fr'}
						class:text-gray-700={selectedLanguage !== 'fr'}
						class:hover:bg-yellow-400={selectedLanguage === 'fr'}
						class:hover:bg-gray-300={selectedLanguage !== 'fr'}
					>
						<span>🇫🇷</span>
						<span>Français</span>
					</button>
					<button
						onclick={() => (selectedLanguage = 'en')}
						class="flex items-center space-x-2 rounded-lg px-4 py-2 font-medium transition-all duration-150"
						class:bg-yellow-500={selectedLanguage === 'en'}
						class:text-white={selectedLanguage === 'en'}
						class:shadow-md={selectedLanguage === 'en'}
						class:bg-gray-200={selectedLanguage !== 'en'}
						class:text-gray-700={selectedLanguage !== 'en'}
						class:hover:bg-yellow-400={selectedLanguage === 'en'}
						class:hover:bg-gray-300={selectedLanguage !== 'en'}
					>
						<span>🇬🇧</span>
						<span>English</span>
					</button>
				</div>
			</div>

			<img
				src="/landing-page.jpg"
				alt="Landing page"
				class="mb-8 rounded-xl shadow-lg max-w-full max-h-[480px]"
			/>
			<div class="flex justify-center space-x-4">
				<button
					onclick={startGame}
					class="transform rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-150 hover:scale-105 hover:bg-yellow-600 hover:shadow-xl"
				>
					Start Game
				</button>
				<a
					href="/stats"
					class="transform rounded-xl bg-gray-200 px-8 py-4 text-lg font-bold text-gray-800 shadow-lg transition-all duration-150 hover:scale-105 hover:bg-gray-300 hover:shadow-xl"
				>
					View Stats
				</a>
			</div>
		</div>
	{:else if gameState.isGameComplete}
		<div class="max-w-md text-center" in:scale={{ duration: 500, easing: backOut }}>
			<div class="mb-6">
				{#if gameState.score >= 7}
					<div class="mb-4 text-6xl">🏆</div>
					<h2 class="mb-2 text-3xl font-bold text-green-600">Congratulations!</h2>
					<p class="text-lg text-gray-600">You're a Flag Master!</p>
				{:else}
					<div class="mb-4 text-6xl">📚</div>
					<h2 class="mb-2 text-3xl font-bold text-blue-600">Good Try!</h2>
					<p class="text-lg text-gray-600">Keep practicing to improve!</p>
				{/if}
			</div>

			<div class="mb-6 rounded-xl bg-white p-6 shadow-lg">
				<div class="grid grid-cols-2 gap-4 text-center">
					<div>
						<div class="text-2xl font-bold text-yellow-600">{gameState.score}</div>
						<div class="text-sm text-gray-500">Correct</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-yellow-600">
							{Math.round((gameState.score / gameState.questions.length) * 100)}%
						</div>
						<div class="text-sm text-gray-500">Accuracy</div>
					</div>
				</div>
			</div>

			<div class="space-y-3">
				<button
					onclick={restartGame}
					class="w-full transform rounded-lg bg-yellow-500 px-6 py-3 font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-yellow-600"
				>
					Play Again
				</button>
				<a
					href="/stats"
					class="block w-full transform rounded-lg bg-gray-200 px-6 py-3 text-center font-bold text-gray-800 transition-all duration-150 hover:scale-105 hover:bg-gray-300"
				>
					View Stats
				</a>
			</div>
		</div>
	{:else if currentQuestion}
		<div class="w-full max-w-2xl" in:fly={{ y: 50, duration: 500, easing: quintOut }}>
			<!-- Progress Bar -->
			<div class="mb-6">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-gray-600"
						>Question {gameState.currentQuestion + 1} of {gameState.questions.length}</span
					>
					<span class="text-sm font-medium text-gray-600">Score: {gameState.score}</span>
				</div>
				<div class="h-2 w-full rounded-full bg-gray-200">
					<div
						class="h-2 rounded-full bg-yellow-500 transition-all duration-300 ease-out"
						style="width: {progress}%"
					></div>
				</div>
			</div>

			<!-- Flag Display -->
			<div class="mb-8 text-center">
				<div class="relative inline-block">
					{#key currentQuestion.country.cca3}
						<img
							src={currentQuestion.country.flags.svg}
							alt="Flag"
							class="w-full max-h-96 rounded-xl object-contain shadow-lg"
							in:scale={{ duration: 400, easing: backOut }}
						/>
					{/key}

					{#if showingResult}
						<div
							class="absolute inset-0 flex items-center justify-center rounded-xl"
							class:bg-green-500={gameState.lastAnswerCorrect}
							class:bg-red-500={!gameState.lastAnswerCorrect}
							class:bg-opacity-90={showingResult}
							in:fade={{ duration: 200 }}
						>
							<div class="text-4xl text-white">
								{gameState.lastAnswerCorrect ? '✓' : '✗'}
							</div>
						</div>
					{/if}
				</div>

				{#if showingResult}
					<div class="mt-4" in:fade={{ duration: 200, delay: 200 }}>
						<p class="text-lg font-semibold text-gray-800">
							{getCountryName(currentQuestion.country, selectedLanguage)}
						</p>
					</div>
				{/if}
			</div>

			<!-- Answer Options -->
			<div class="grid grid-cols-2 gap-4">
				{#each currentQuestion.options as option, index}
					{#key option.cca3}
						<button
							onclick={() => selectAnswer(getCountryName(option, selectedLanguage))}
							disabled={showingResult}
							class="transform rounded-xl border-2 p-4 text-left transition-all duration-150 hover:scale-105 disabled:transform-none"
							class:border-gray-200={!showingResult}
							class:hover:border-yellow-300={!showingResult}
							class:hover:bg-yellow-50={!showingResult}
							class:border-green-500={showingResult &&
								getCountryName(option, selectedLanguage) === currentQuestion.correctAnswer}
							class:bg-green-100={showingResult &&
								getCountryName(option, selectedLanguage) === currentQuestion.correctAnswer}
							class:border-red-500={showingResult &&
								selectedAnswer === getCountryName(option, selectedLanguage) &&
								!gameState.lastAnswerCorrect}
							class:bg-red-100={showingResult &&
								selectedAnswer === getCountryName(option, selectedLanguage) &&
								!gameState.lastAnswerCorrect}
							class:opacity-50={showingResult &&
								getCountryName(option, selectedLanguage) !== currentQuestion.correctAnswer &&
								selectedAnswer !== getCountryName(option, selectedLanguage)}
							in:fly={{ y: 20, duration: 250, delay: index * 50, easing: quintOut }}
						>
							<span class="font-medium text-gray-800"
								>{getCountryName(option, selectedLanguage)}</span
							>
							{#if showingResult && getCountryName(option, selectedLanguage) === currentQuestion.correctAnswer}
								<span class="float-right text-green-600">✓</span>
							{:else if showingResult && selectedAnswer === getCountryName(option, selectedLanguage) && !gameState.lastAnswerCorrect}
								<span class="float-right text-red-600">✗</span>
							{/if}
						</button>
					{/key}
				{/each}
			</div>
		</div>
	{/if}
</div>

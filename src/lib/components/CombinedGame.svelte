<script lang="ts">
	import { fetchCountries, generateGameQuestions, getCountryName } from '$lib/api';
	import type { Country, GameState, Language } from '$lib/types';
	import { saveGameStats } from '$lib/db/service';
	import { onMount } from 'svelte';
	import { backOut, quintOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';
	import { MapLibre, GeoJSONSource, FillLayer } from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';

	const GAME_STATE_KEY = 'combinedGameState';

	interface SavedCombinedGameState {
		currentQuestion: number;
		score: number;
		startTime: number;
		questionOrder: string[];
		selectedLanguage: Language;
		currentPhase: 'flag' | 'map';
		flagAnswerCorrect: boolean | null;
	}

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
	let currentPhase = $state<'flag' | 'map'>('flag');
	let flagAnswerCorrect = $state<boolean | null>(null);

	let map: maplibregl.Map | undefined = $state();
	let highlightedCountryCca3: string | null = $state(null);
	let highlightColor: string = $state('transparent');
	let countryFeatures: any[] = $state([]);

	onMount(async () => {
		try {
			const [fetchedCountries, geojsonResponse] = await Promise.all([
				fetchCountries(),
				fetch('/countries.geojson')
			]);
			countries = fetchedCountries;
			const geojsonData = await geojsonResponse.json();
			countryFeatures = geojsonData.features;

			const savedStateJSON = localStorage.getItem(GAME_STATE_KEY);
			if (savedStateJSON) {
				const savedState: SavedCombinedGameState = JSON.parse(savedStateJSON);

				const questionCountries = savedState.questionOrder
					.map((cca3) => countries.find((c) => c.cca3 === cca3))
					.filter((c): c is Country => Boolean(c));

				if (questionCountries.length > 0) {
					gameState.questions = generateGameQuestions(questionCountries, questionCountries.length, savedState.selectedLanguage);
					gameState.currentQuestion = savedState.currentQuestion;
					gameState.score = savedState.score;
					gameState.startTime = savedState.startTime;
					selectedLanguage = savedState.selectedLanguage;
					currentPhase = savedState.currentPhase;
					flagAnswerCorrect = savedState.flagAnswerCorrect;
					gameStarted = true;
				} else {
					localStorage.removeItem(GAME_STATE_KEY);
				}
			}
		} catch (error) {
			console.error('Failed to load countries or saved game state:', error);
			localStorage.removeItem(GAME_STATE_KEY);
		} finally {
			loading = false;
		}
	});

	$effect(() => {
		if (gameStarted && !gameState.isGameComplete) {
			try {
				const stateToSave: SavedCombinedGameState = {
					currentQuestion: gameState.currentQuestion,
					score: gameState.score,
					startTime: gameState.startTime,
					questionOrder: gameState.questions.map((q) => q.country.cca3),
					selectedLanguage: selectedLanguage,
					currentPhase: currentPhase,
					flagAnswerCorrect: flagAnswerCorrect
				};
				localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
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
		currentPhase = 'flag';
		flagAnswerCorrect = null;
		highlightedCountryCca3 = null;
	}

	function selectAnswer(countryName: string) {
		if (showingResult || currentPhase !== 'flag') return;

		selectedAnswer = countryName;
		const isCorrect = countryName === gameState.questions[gameState.currentQuestion].correctAnswer;

		flagAnswerCorrect = isCorrect;
		gameState.lastAnswerCorrect = isCorrect;
		showingResult = true;

		setTimeout(() => {
			showingResult = false;
			currentPhase = 'map';
			gameState.lastAnswerCorrect = null;
		}, 1500);
	}

	function getCountryFromEvent(event: maplibregl.MapMouseEvent): Country | undefined {
		if (!map) return;

		const features = map.queryRenderedFeatures(event.point, {
			layers: ['country-polygons']
		});

		if (features.length > 0) {
			const countryProps = features[0].properties;
			const cca3 = countryProps.iso_a3;
			return countries.find((c) => c.cca3 === cca3);
		}
	}

	function zoomToCountry(cca3: string) {
		if (!map) return;

		let feature = countryFeatures.find((f) => f.properties.iso_a3 === cca3);
		
		if (!feature) {
			feature = countryFeatures.find((f) => 
				f.properties.iso_a3_eh === cca3 || 
				f.properties.adm0_a3 === cca3 ||
				f.properties.wb_a3 === cca3
			);
		}

		if (!feature) {
			const country = countries.find((c) => c.cca3 === cca3);
			if (country) {
				feature = countryFeatures.find((f) => 
					f.properties.iso_a2 === country.cca2 ||
					f.properties.name?.toLowerCase() === country.name.common.toLowerCase() ||
					f.properties.name_long?.toLowerCase() === country.name.common.toLowerCase()
				);
			}
		}

		if (feature) {
			const geometry = feature.geometry;

			if (geometry.type === 'Polygon') {
				const coordinates = geometry.coordinates[0];
				const bounds = coordinates.reduce(
					(bounds, coord) => {
						return bounds.extend(coord as [number, number]);
					},
					new maplibregl.LngLatBounds(
						coordinates[0] as [number, number],
						coordinates[0] as [number, number]
					)
				);
				map.fitBounds(bounds, { padding: 40, maxZoom: 6, duration: 1000 });
			} else if (geometry.type === 'MultiPolygon') {
				const allCoords = geometry.coordinates.flat(2);
				const bounds = allCoords.reduce(
					(bounds, coord) => {
						return bounds.extend(coord as [number, number]);
					},
					new maplibregl.LngLatBounds(
						allCoords[0] as [number, number],
						allCoords[0] as [number, number]
					)
				);
				map.fitBounds(bounds, { padding: 40, maxZoom: 6, duration: 1000 });
			}
		} else {
			map.flyTo({
				center: [0, 20],
				zoom: 1.5,
				duration: 1000,
				easing: quintOut
			});
		}
	}

	function handleMapClick(event: maplibregl.MapMouseEvent) {
		if (showingResult || currentPhase !== 'map' || !currentQuestion) return;

		const clickedCountry = getCountryFromEvent(event);
		if (!clickedCountry) return;

		const isCorrect = clickedCountry.cca3 === currentQuestion.country.cca3;
		const mapAnswerCorrect = isCorrect;
		
		// Calculate final score for this question
		// Both flag and map must be correct to get a point
		const bothCorrect = flagAnswerCorrect && mapAnswerCorrect;
		if (bothCorrect) {
			gameState.score++;
		}

		gameState.lastAnswerCorrect = mapAnswerCorrect;
		showingResult = true;

		if (mapAnswerCorrect) {
			highlightColor = '#22c55e'; // green-500
		} else {
			highlightColor = '#ef4444'; // red-500
		}
		
		highlightedCountryCca3 = currentQuestion.country.cca3;
		zoomToCountry(currentQuestion.country.cca3);

		setTimeout(() => {
			nextQuestion();
		}, 2000);
	}

	function nextQuestion() {
		if (map) {
			map.flyTo({
				center: [0, 20],
				zoom: 1,
				duration: 1000,
				easing: quintOut
			});
		}

		if (gameState.currentQuestion < gameState.questions.length - 1) {
			gameState.currentQuestion++;
			selectedAnswer = '';
			showingResult = false;
			gameState.lastAnswerCorrect = null;
			highlightedCountryCca3 = null;
			currentPhase = 'flag';
			flagAnswerCorrect = null;
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
		highlightedCountryCca3 = null;
		currentPhase = 'flag';
		flagAnswerCorrect = null;
		localStorage.removeItem(GAME_STATE_KEY);
	}

	let currentQuestion = $derived(gameState.questions[gameState.currentQuestion]);
	let progress = $derived(((gameState.currentQuestion + 1) / gameState.questions.length) * 100);
</script>

<div class="relative mx-auto flex h-full w-full max-w-full items-center justify-center">
	{#if loading}
		<div class="text-center" in:fade={{ duration: 200 }}>
			<div
				class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-yellow-600"
			></div>
			<p class="text-lg text-gray-600">Loading countries and map...</p>
		</div>
	{:else if !gameStarted}
		<div class="text-center" in:scale={{ duration: 300, easing: backOut }}>
			<h1 class="mb-6 text-4xl font-bold text-gray-900">🌎🗺️ Ultimate Geography Challenge 🗺️🌎</h1>
			<p class="mb-8 text-lg text-gray-600">
				The ultimate test! First identify the flag, then find the country on the map. Both must be correct to score!
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

			<div class="flex justify-center space-x-4">
				<button
					onclick={startGame}
					class="transform rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-150 hover:scale-105 hover:bg-yellow-600 hover:shadow-xl"
				>
					Start Challenge
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
					<h2 class="mb-2 text-3xl font-bold text-green-600">Incredible!</h2>
					<p class="text-lg text-gray-600">You're a Geography Master!</p>
				{:else}
					<div class="mb-4 text-6xl">📚</div>
					<h2 class="mb-2 text-3xl font-bold text-blue-600">Good Effort!</h2>
					<p class="text-lg text-gray-600">This challenge is tough - keep practicing!</p>
				{/if}
			</div>

			<div class="mb-6 rounded-xl bg-white p-6 shadow-lg">
				<div class="grid grid-cols-2 gap-4 text-center">
					<div>
						<div class="text-2xl font-bold text-yellow-600">{gameState.score}</div>
						<div class="text-sm text-gray-500">Perfect Matches</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-yellow-600">
							{Math.round((gameState.score / gameState.questions.length) * 100)}%
						</div>
						<div class="text-sm text-gray-500">Success Rate</div>
					</div>
				</div>
			</div>

			<div class="space-y-3">
				<button
					onclick={restartGame}
					class="w-full transform rounded-lg bg-yellow-500 px-6 py-3 font-bold text-white transition-all duration-150 hover:scale-105 hover:bg-yellow-600"
				>
					Try Again
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
		{#if currentPhase === 'flag'}
			<!-- Flag Phase -->
			<div class="w-full max-w-2xl" in:fly={{ y: 50, duration: 500, easing: quintOut }}>
				<!-- Progress Bar -->
				<div class="mb-6">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-medium text-gray-600"
							>Question {gameState.currentQuestion + 1} of {gameState.questions.length} - Flag Phase</span
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

				<!-- Phase Indicator -->
				<div class="mb-6 text-center">
					<div class="inline-flex items-center space-x-4 rounded-lg bg-blue-100 px-4 py-2">
						<div class="flex items-center space-x-2">
							<div class="h-3 w-3 rounded-full bg-blue-500"></div>
							<span class="text-sm font-medium text-blue-700">1. Identify Flag</span>
						</div>
						<div class="flex items-center space-x-2">
							<div class="h-3 w-3 rounded-full bg-gray-300"></div>
							<span class="text-sm font-medium text-gray-500">2. Find on Map</span>
						</div>
					</div>
				</div>

				<!-- Flag Display -->
				<div class="mb-8 text-center">
					<div class="relative inline-block">
						{#key currentQuestion.country.cca3}
							<img
								src={currentQuestion.country.flags.svg}
								alt="Flag"
								class="max-h-96 w-full rounded-xl object-contain shadow-lg"
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
							<p class="text-sm text-gray-600 mt-2">
								{flagAnswerCorrect ? 'Correct! Now find it on the map...' : 'Wrong flag, but you can still find it on the map!'}
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
		{:else}
			<!-- Map Phase -->
			<div class="h-full w-full">
				<MapLibre
					bind:map
					class="h-full w-full cursor-pointer"
					style="/map-style.json"
					onclick={handleMapClick}
				>
					<GeoJSONSource id="countries" data="/countries.geojson">
						<FillLayer
							id="country-polygons"
							paint={{
								'fill-color': [
									'case',
									['==', ['get', 'iso_a3'], highlightedCountryCca3 || ''],
									highlightColor,
									'#000000'
								],
								'fill-opacity': [
									'case',
									['==', ['get', 'iso_a3'], highlightedCountryCca3 || ''],
									0.5,
									0
								]
							}}
						/>
					</GeoJSONSource>
				</MapLibre>

				<div
					class="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/20 to-transparent p-4"
				>
					<div class="mx-auto max-w-2xl">
						<!-- Progress Bar -->
						<div class="mb-4">
							<div class="mb-2 flex items-center justify-between text-white">
								<span class="text-sm font-medium"
									>Question {gameState.currentQuestion + 1} of {gameState.questions.length} - Map Phase</span
								>
								<span class="text-sm font-medium">Score: {gameState.score}</span>
							</div>
							<div class="h-2 w-full rounded-full bg-white/30">
								<div
									class="h-2 rounded-full bg-yellow-400 transition-all duration-300 ease-out"
									style="width: {progress}%"
								></div>
							</div>
						</div>

						<!-- Phase Indicator -->
						<div class="mb-4 flex justify-center">
							<div class="inline-flex items-center space-x-4 rounded-lg bg-white/20 px-4 py-2">
								<div class="flex items-center space-x-2">
									<div class="h-3 w-3 rounded-full" class:bg-green-400={flagAnswerCorrect} class:bg-red-400={!flagAnswerCorrect}></div>
									<span class="text-sm font-medium text-white">1. Flag {flagAnswerCorrect ? '✓' : '✗'}</span>
								</div>
								<div class="flex items-center space-x-2">
									<div class="h-3 w-3 rounded-full bg-blue-400"></div>
									<span class="text-sm font-medium text-white">2. Find on Map</span>
								</div>
							</div>
						</div>

						<!-- Question -->
						<div class="text-center">
							<p class="text-lg text-white">Now click on</p>
							<h2
								class="text-4xl font-bold text-white"
								style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);"
							>
								{getCountryName(currentQuestion.country, selectedLanguage)}
							</h2>
							{#if showingResult}
								<div
									class="pointer-events-none flex items-center justify-center"
									in:fade={{ duration: 200 }}
								>
									<div
										class="text-8xl text-white"
										style="text-shadow: 0 4px 8px rgba(0,0,0,0.5);"
										in:scale={{ duration: 300, easing: backOut }}
									>
										{gameState.lastAnswerCorrect ? '✅' : '❌'}
									</div>
								</div>
								<div class="mt-4" in:fade={{ duration: 200, delay: 200 }}>
									<p class="text-lg text-white" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
										{flagAnswerCorrect && gameState.lastAnswerCorrect ? 'Perfect! Both correct!' : 
										 flagAnswerCorrect && !gameState.lastAnswerCorrect ? 'Flag correct, map wrong' :
										 !flagAnswerCorrect && gameState.lastAnswerCorrect ? 'Flag wrong, map correct' :
										 'Both incorrect'}
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

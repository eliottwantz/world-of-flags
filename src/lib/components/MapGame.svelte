<script lang="ts">
	import { fetchCountries, getRandomCountries, getCountryName } from '$lib/api';
	import type { Country, GameState, Language } from '$lib/types';
	import { saveGameStats } from '$lib/db/service';
	import { onMount } from 'svelte';
	import { backOut, quintOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';
	import { MapLibre, GeoJSONSource, FillLayer } from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';

	const GAME_STATE_KEY = 'mapGameState';

	interface SavedMapGameState {
		currentQuestion: number;
		score: number;
		startTime: number;
		questionOrder: string[];
		selectedLanguage: Language;
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
	let showingResult = $state(false);
	let gameStarted = $state(false);
	let selectedLanguage = $state<Language>('fr');

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
				const savedState: SavedMapGameState = JSON.parse(savedStateJSON);

				const questionCountries = savedState.questionOrder
					.map((cca3) => countries.find((c) => c.cca3 === cca3))
					.filter((c): c is Country => Boolean(c));

				if (questionCountries.length > 0) {
					gameState.questions = questionCountries.map((c) => ({
						country: c,
						options: [],
						correctAnswer: getCountryName(c, savedState.selectedLanguage)
					}));
					gameState.currentQuestion = savedState.currentQuestion;
					gameState.score = savedState.score;
					gameState.startTime = savedState.startTime;
					selectedLanguage = savedState.selectedLanguage;
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
				const stateToSave: SavedMapGameState = {
					currentQuestion: gameState.currentQuestion,
					score: gameState.score,
					startTime: gameState.startTime,
					questionOrder: gameState.questions.map((q) => q.country.cca3),
					selectedLanguage: selectedLanguage
				};
				localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
			} catch (error) {
				console.error('Failed to save game state:', error);
			}
		}
	});

	function startGame() {
		const gameCountries = getRandomCountries(countries, countries.length);
		gameState = {
			currentQuestion: 0,
			score: 0,
			questions: gameCountries.map((c) => ({
				country: c,
				options: [],
				correctAnswer: getCountryName(c, selectedLanguage)
			})),
			startTime: Date.now(),
			isGameComplete: false,
			lastAnswerCorrect: null,
			showResult: false
		};
		gameStarted = true;
		showingResult = false;
		highlightedCountryCca3 = null;
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

		const feature = countryFeatures.find((f) => f.properties.iso_a3 === cca3);

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
		}
	}

	function handleMapClick(event: maplibregl.MapMouseEvent) {
		if (showingResult || !currentQuestion) return;

		const clickedCountry = getCountryFromEvent(event);
		if (!clickedCountry) return;

		const isCorrect = clickedCountry.cca3 === currentQuestion.country.cca3;
		gameState.lastAnswerCorrect = isCorrect;
		showingResult = true;

		if (isCorrect) {
			gameState.score++;
			highlightColor = '#22c55e'; // green-500
			highlightedCountryCca3 = currentQuestion.country.cca3;
			zoomToCountry(currentQuestion.country.cca3);
			setTimeout(() => {
				nextQuestion();
			}, 1500);
		} else {
			highlightColor = '#ef4444'; // red-500
			highlightedCountryCca3 = currentQuestion.country.cca3;
			zoomToCountry(currentQuestion.country.cca3);
		}
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
			showingResult = false;
			gameState.lastAnswerCorrect = null;
			highlightedCountryCca3 = null;
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
			<p class="text-lg text-gray-600">Loading map and countries...</p>
		</div>
	{:else if !gameStarted}
		<div class="text-center" in:scale={{ duration: 300, easing: backOut }}>
			<h1 class="mb-6 text-4xl font-bold text-gray-900">🗺️ World of Maps 🗺️</h1>
			<p class="mb-8 text-lg text-gray-600">
				Test your geography knowledge! Find the country on the map.
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
					<p class="text-lg text-gray-600">You're a Geography Genius!</p>
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

			<div class="mt-6 flex justify-center space-x-4">
				<a
					href="/"
					class="transform rounded-lg bg-yellow-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-150 hover:scale-105 hover:bg-yellow-600"
				>
					🏳️ Flag Game
				</a>
				<a
					href="/combined"
					class="transform rounded-lg bg-purple-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-150 hover:scale-105 hover:bg-purple-600"
				>
					🌎🗺️ Ultimate Challenge
				</a>
			</div>
		</div>
	{:else if currentQuestion}
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
								>Question {gameState.currentQuestion + 1} of {gameState.questions.length}</span
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

					<!-- Question -->
					<div class="text-center">
						<p class="text-lg text-white">Click on</p>
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
						{/if}
					</div>
				</div>
			</div>

			{#if showingResult && !gameState.lastAnswerCorrect}
				<div
					class="absolute inset-x-0 bottom-0 flex justify-center p-4"
					in:fly={{ y: 100, duration: 300, easing: backOut }}
				>
					<button
						onclick={nextQuestion}
						class="transform rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-150 hover:scale-105 hover:bg-yellow-600 hover:shadow-xl"
					>
						Next
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

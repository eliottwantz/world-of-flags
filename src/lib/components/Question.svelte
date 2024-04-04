<script lang="ts">
	import { game } from '$lib/game.svelte';
	import { base } from '$app/paths';

	let { question }: { question: Question } = $props();
	let imageSrc = $derived(`${base}/svg/${question.answer.code}.svg`);
	let showAnswer = $state(false);
	let choosed = $state<string | undefined>(undefined);
	let countryInputValue = $state<string>('');
	let showDatalist = $derived(countryInputValue.length > 1);

	const handleClick = (choice: string) => {
		game.selectAnswer(choice);
		showAnswer = true;
		choosed = choice;
	};

	const handleInputSubmit = () => {
		game.selectAnswer(countryInputValue);
		showAnswer = true;
		choosed = countryInputValue;
	};

	const nextQuestion = () => {
		if (!showAnswer) return;
		showAnswer = false;
		choosed = undefined;
		countryInputValue = '';
		game.nextQuestion();
	};
</script>

<div class="flex flex-col gap-2 sm:gap-4">
	<h1 class="text-center text-xl font-semibold leading-10 md:text-3xl">What flag is this?</h1>
	<div class="flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-xl">
		<img class="border-2 border-black/30 p-2" src={imageSrc} alt="flag" />

		{#if game.mode === 'multiple-choice'}
			<div class="grid grid-cols-3 gap-2">
				{#each question.choices as choice}
					<button
						disabled={showAnswer}
						class="scale-100 transform rounded-lg border-2 p-2 shadow-md transition duration-100 ease-in-out hover:cursor-pointer active:scale-90
					{!showAnswer && 'border-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'}
					{showAnswer &&
							choice === question.answer.name &&
							'border-green-500 bg-green-500/10 hover:bg-green-500/20'}
					{showAnswer &&
							choosed === choice &&
							choice !== question.answer.name &&
							'border-red-500 bg-red-500/10 hover:bg-red-500/20'}
					"
						on:click={() => handleClick(choice)}
					>
						{choice}
					</button>
				{/each}
			</div>
		{:else if !showAnswer}
			<form
				class="flex w-full flex-col items-center gap-y-2"
				on:submit|preventDefault={handleInputSubmit}
			>
				<div class="relative w-full">
					<input
						type="text"
						list="countries"
						autocomplete="off"
						autofocus
						bind:value={countryInputValue}
						class="w-full rounded-lg border-yellow-400 bg-yellow-400/10 pe-10 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 sm:text-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-list-button]:hidden [&::-webkit-list-button]:opacity-0"
					/>
					<span class="absolute inset-y-0 end-0 flex w-8 items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5 text-black/70"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
							/>
						</svg>
					</span>
				</div>
				{#if showDatalist}
					<datalist id="countries">
						{#each game.countryNames as country}
							<option value={country} />
						{/each}
					</datalist>
				{/if}

				<button
					type="submit"
					class="{!countryInputValue.length
						? 'hidden'
						: 'block'} scale-100 transform rounded-lg border-2 border-yellow-400 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:cursor-pointer hover:bg-yellow-400/20 active:scale-90"
					>Verify</button
				>
			</form>
		{:else}
			<p
				class="rounded-lg p-2 text-lg font-semibold {question.answer.name.toLowerCase() ===
				countryInputValue.trim().toLowerCase()
					? 'bg-green-500/60'
					: 'bg-red-500/60'}"
			>
				{question.answer.name}
			</p>
		{/if}

		{#if showAnswer}
			<form on:submit|preventDefault={nextQuestion}>
				<button
					type="submit"
					disabled={!showAnswer}
					autofocus
					class="flex scale-100 transform rounded-full border-2 border-gray-400 bg-gray-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-gray-400/20 active:scale-90 disabled:cursor-not-allowed"
				>
					<span>Next</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M16.15 13H5q-.425 0-.712-.288T4 12q0-.425.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375q0 .2-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z"
						/></svg
					>
				</button>
			</form>
		{/if}
	</div>
</div>

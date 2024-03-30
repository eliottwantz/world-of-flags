<script lang="ts">
	import { game } from '$lib/game.svelte';
	import { base } from '$app/paths';

	let { question }: { question: Question } = $props();
	let imageSrc = $derived(`${base}/svg/${question.answer.code}.svg`);
	let showAnswer = $state(false);
	let choosed = $state<string | undefined>(undefined);

	const handleClick = (choice: string) => {
		showAnswer = true;
		choosed = choice;
		game.selectAnswer(choice);
	};

	const nextQuestion = () => {
		if (!showAnswer) return;
		showAnswer = false;
		choosed = undefined;
		game.nextQuestion();
	};
</script>

<div class="flex flex-col gap-2 sm:gap-4">
	<h1 class="text-center text-xl font-semibold leading-10 md:text-3xl">What flag is this?</h1>
	<div class="flex w-full flex-col items-center gap-4">
		<img class="max-w-xs border-2 border-black/30 p-2 md:max-w-xl" src={imageSrc} alt="flag" />
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
		{#if showAnswer}
			<button
				disabled={!showAnswer}
				class="flex scale-100 transform rounded-full border-2 border-gray-400 bg-gray-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-gray-400/20 active:scale-90 disabled:cursor-not-allowed"
				on:click={nextQuestion}
			>
				<span>Next</span>
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M16.15 13H5q-.425 0-.712-.288T4 12q0-.425.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375q0 .2-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z"
					/></svg
				>
			</button>
		{/if}
	</div>
</div>

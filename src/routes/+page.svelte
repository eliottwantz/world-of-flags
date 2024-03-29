<script lang="ts">
	import Question from '$lib/components/Question.svelte';
	import { game } from '$lib/game.svelte';

	let resetClicked = $state(false);

	function handleReset() {
		if (!resetClicked) {
			resetClicked = true;
			setTimeout(() => {
				resetClicked = false;
			}, 2000);
		} else {
			resetClicked = false;
			game.reset();
		}
	}
</script>

<svelte:head>
	<title>World of Flags</title>
</svelte:head>

<main class="mx-auto flex min-h-svh max-w-screen-lg flex-col py-4">
	<header class="mb-8">
		<h1 class="text-center text-5xl font-semibold leading-10">World of Flags</h1>
		<div class="absolute right-3 top-3">
			<button
				class="flex scale-100 transform items-center gap-x-2 rounded-lg border-2 bg-red-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-red-400/20 active:scale-90 {resetClicked
					? 'border-red-500'
					: 'border-red-400/40'}"
				onclick={handleReset}
			>
				{#if resetClicked}
					<span>Reset ???</span>
				{:else}
					<span>Reset</span>
				{/if}
				<span>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 21 21"
						><g
							fill="none"
							fill-rule="evenodd"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M3.578 6.487A8 8 0 1 1 2.5 10.5" /><path d="M7.5 6.5h-4v-4" /></g
						></svg
					>
				</span>
			</button>
		</div>
	</header>

	<div class="flex h-full items-center justify-center">
		<div class="flex flex-col items-center gap-y-4">
			<div class="">
				<div class="flex gap-2">
					<p class="rounded-lg bg-gray-200 px-2">
						Question {game.current}. / {game.questions.length}
					</p>
					<p class="rounded-lg bg-green-500 px-2">{game.right.length} correct</p>
					<p class="rounded-lg bg-red-500/70 px-2">{game.wrong.length} incorrect</p>
				</div>
			</div>
			<Question question={game.currentQuestion} />
		</div>
	</div>
</main>

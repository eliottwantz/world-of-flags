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
	</header>

	<div class="flex h-full items-center justify-center">
		<div class="flex flex-col items-center gap-y-4">
			<div class="flex items-center gap-x-4">
				<p class="text-2xl">Score: {game.score}</p>
				<button
					class="scale-100 transform rounded-lg border-2 border-red-400 bg-red-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-red-400/20 active:scale-90"
					onclick={handleReset}
				>
					{#if resetClicked}
						<span>Reset ???</span>
					{:else}
						<span>Reset</span>
					{/if}
				</button>
			</div>
			<Question question={game.currentQuestion} />
		</div>
	</div>
</main>

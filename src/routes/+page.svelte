<script lang="ts">
	import { game } from '$lib/game.svelte';
	import Question from '$lib/components/Question.svelte';
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
			<!-- <p class="text-2xl">Score: {game.score}</p> -->
			<!-- <Question question={game.currentQuestion} /> -->
		</div>
	</div>

	<pre>
		{JSON.stringify(game, null, 2)}
	</pre>
	<div>{game}</div>
</main>

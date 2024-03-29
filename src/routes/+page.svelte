<script lang="ts">
	import { getQuestions, getScore } from '$lib';
	import Question from '$lib/components/Question.svelte';

	let questions = getQuestions();
	let score = getScore();
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
			<p class="text-2xl">Score: {score}</p>
			<Question question={questions[0]} />
		</div>
	</div>
</main>

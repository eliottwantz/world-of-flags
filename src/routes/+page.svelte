<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/game.svelte';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>World of Flags</title>
</svelte:head>

<main class="mx-auto flex min-h-svh max-w-screen-xl flex-col items-center py-4">
	<header class="mb-8 flex flex-col items-center gap-y-4">
		<h1 class="text-5xl font-semibold leading-10">World of Flags</h1>
	</header>

	<div class="flex flex-col items-center gap-4">
		<img class="max-w-lg" src="/landing-page.jpg" alt="a lot of flags" />
		<div class="flex flex-col gap-2">
			<button
				on:click={() => {
					game.reset();
					goto(`${base}/game`);
				}}
				class="scale-100 transform rounded-lg border-2 border-yellow-400 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-yellow-400/20 active:scale-90"
				>New Game</button
			>
			<button
				on:click={() => goto('/game')}
				class="scale-100 transform rounded-lg border-2 border-yellow-400/60 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-yellow-400/20 active:scale-90"
				>Resume</button
			>
		</div>
	</div>
</main>

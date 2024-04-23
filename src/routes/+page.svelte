<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/game.svelte';

	let dialog: HTMLDialogElement;

	const handleDialog = () => {
		console.log(dialog.returnValue);
		const value = dialog.returnValue;

		if (value === 'exact-match') {
			game.startNew('exact-match');
		} else if (value === 'multiple-choice') {
			game.startNew('multiple-choice');
		}

		goto('/game');
		dialog.close();
	};
</script>

<main class="mx-auto flex min-h-svh max-w-screen-xl flex-col items-center py-4">
	<header class="mb-8 flex flex-col items-center gap-y-4">
		<h1 class="text-5xl font-semibold leading-10">World of Flags</h1>
	</header>

	<div class="flex flex-col items-center gap-4">
		<img class="max-w-lg" src="/landing-page.jpg" alt="a lot of flags" />
		<div class="flex flex-col gap-2">
			<button
				on:click={() => dialog.showModal()}
				class="scale-100 transform rounded-lg border-2 border-yellow-400 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-yellow-400/20 active:scale-90"
				>New Game</button
			>
			<button
				on:click={() => {
					goto('/game');
				}}
				class="scale-100 transform rounded-lg border-2 border-yellow-400/60 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-yellow-400/20 active:scale-90"
				>Resume</button
			>
		</div>
	</div>
</main>

<dialog
	class="absolute inset-0 p-4 backdrop:bg-black/60"
	bind:this={dialog}
	on:close={handleDialog}
>
	<h1>Select a game mode</h1>
	<form class="mt-4 flex gap-2" method="dialog">
		<button class="rounded bg-gray-300 p-2" value="cancel" formmethod="dialog">Cancel</button>
		<button
			class="scale-100 transform rounded-lg border-2 border-yellow-400 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:cursor-pointer hover:bg-yellow-400/20 active:scale-90"
			value="multiple-choice">Multiple Choice</button
		>
		<button
			class="scale-100 transform rounded-lg border-2 border-yellow-400 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:cursor-pointer hover:bg-yellow-400/20 active:scale-90"
			value="exact-match">Expert</button
		>
	</form>
</dialog>

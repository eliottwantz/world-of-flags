<script lang="ts">
	import Question from '$lib/components/Question.svelte';
	import { game } from '$lib/game.svelte';

	let dialog: HTMLDialogElement;

	function handleFormClose() {
		console.log('dialog close returned', dialog.returnValue);
		if (dialog.returnValue === 'confirm') {
			game.reset();
		}

		dialog.close();
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
				class="flex scale-100 transform items-center gap-x-2 rounded-lg border-2 border-red-500 bg-red-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-red-400/20 active:scale-90"
				onclick={() => dialog.showModal()}
			>
				<span>Reset</span>
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

<dialog
	class="absolute inset-0 p-4 backdrop:bg-black/60"
	bind:this={dialog}
	on:close={handleFormClose}
>
	<h1>Are you sure you want to reset the game?</h1>
	<form class="mt-4 flex gap-2" method="dialog">
		<button class="rounded bg-gray-300 p-2" value="cancel" formmethod="dialog">Cancel</button>
		<button class="rounded bg-red-400 p-2" value="confirm">Confirm</button>
	</form>
</dialog>

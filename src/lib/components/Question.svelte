<script lang="ts">
	let { question }: { question: Question } = $props();

	function selectAnswer(value: string) {
		if (question.answer.code === value) {
			console.log('VALID ANSWER');
		}
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-center text-3xl font-semibold leading-10">What flag is this?</h1>
	<div class="flex w-full flex-col items-center gap-4">
		<img
			width="400"
			height="200"
			class="max-w-xl border-2 border-black/30 p-2"
			src="/svg/{question.answer.code}.svg"
			alt="flag"
		/>
		<div class="grid grid-cols-3 gap-2">
			{#each question.choices as choice}
				<button
					class="scale-100 transform rounded-lg border-2 border-yellow-400 bg-yellow-400/10 p-2 shadow-md transition duration-100 ease-in-out hover:bg-yellow-400/20 active:scale-90"
					on:click={() => selectAnswer(choice)}
				>
					{choice}
				</button>
			{/each}
		</div>
	</div>
</div>
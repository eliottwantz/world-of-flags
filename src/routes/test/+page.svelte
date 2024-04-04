<script lang="ts">
	import type { EventHandler, FormEventHandler } from 'svelte/elements';

	let inputValue = '';
	let suggestions: string[] = [];
	const options = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Grapes', 'Strawberry'];

	const handleInputChange: FormEventHandler<HTMLInputElement> = (event) => {
		inputValue = event.currentTarget.value;
		if (inputValue.length >= 2) {
			suggestions = options.filter((option) =>
				option.toLowerCase().includes(inputValue.toLowerCase())
			);
		} else {
			suggestions = [];
		}
	};

	function handleSuggestionClick(suggestion: string) {
		inputValue = suggestion;
		suggestions = [];
	}
</script>

<label for="autocomplete">Search:</label>
<input type="text" id="autocomplete" on:input={handleInputChange} bind:value={inputValue} />

{#if suggestions.length > 0}
	<ul class="suggestion-list">
		{#each suggestions as suggestion (suggestion)}
			<li class="suggestion-item">
				<button on:click={() => handleSuggestionClick(suggestion)}>{suggestion}</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.suggestion-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.suggestion-item {
		cursor: pointer;
		padding: 5px;
	}
	.suggestion-item:hover {
		background-color: #f0f0f0;
	}
</style>

<script lang="ts">
	import FlagGame from '$lib/components/FlagGame.svelte';
</script>

<svelte:head>
	<title>World of Flags</title>
</svelte:head>

<FlagGame />

<div class="mt-8 flex justify-center space-x-4">
	<a
		href="/map"
		class="transform rounded-xl bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all duration-150 hover:scale-105 hover:bg-blue-600 hover:shadow-xl"
	>
		🗺️ Map Game
	</a>
	<a
		href="/combined"
		class="transform rounded-xl bg-purple-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all duration-150 hover:scale-105 hover:bg-purple-600 hover:shadow-xl"
	>
		🌎🗺️ Ultimate Challenge
	</a>
</div>

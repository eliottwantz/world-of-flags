<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>World of Flags</title>
</svelte:head>

<main class="mx-auto flex min-h-svh max-w-screen-lg flex-col py-4">
	<header>
		<h1 class="text-center text-5xl font-semibold leading-10">World of Flags</h1>
	</header>

	<div class="flex h-full flex-1 items-center justify-center">
		<div>
			<p class="text-xl">
				Select a country to see the flag of the country and the language spoken in that country
			</p>
		</div>
	</div>
</main>

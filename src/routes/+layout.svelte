<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<main class="h-dvh bg-gradient-to-br from-yellow-50 to-amber-100">
	{@render children()}
</main>

<style>
	:global(html) {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>

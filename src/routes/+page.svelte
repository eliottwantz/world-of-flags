<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>World of Flags</title>
</svelte:head>

<main>
	<pre>
		{JSON.stringify(data.flags, null, 2)}
	</pre>
</main>

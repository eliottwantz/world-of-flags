<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>World of Flags</title>
</svelte:head>

<pre>
	{JSON.stringify(data.flags, null, 2)}
</pre>

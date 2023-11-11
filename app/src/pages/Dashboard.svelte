<script lang="ts">
	import LoggedInBar from "../components/LoggedInBar.svelte";
	import { user, path } from "../stores";
</script>

<LoggedInBar />
{#if $user}
	<h2>
		Hello, {$user.name}
		{#if $user.pronouns}
			({$user.pronouns})
		{/if}
	</h2>
{/if}

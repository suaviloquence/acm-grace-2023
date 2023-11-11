<script lang="ts">
	import LoggedInBar from "../components/LoggedInBar.svelte";
	import type { User } from "../models/user";

	export let username: string;

	let info_pms: Promise<User> = fetch(`/api/user/${username}`).then((res) =>
		res.json()
	);
</script>

<LoggedInBar />
{#await info_pms}
	Loading user…
{:then info}
	<h2>
		{info.name}
		{#if info.pronouns} ({info.pronouns}) {/if}
	</h2>
	<ul>
		<li>{info.username}</li>
		{#if info.year}
			<li>Class of {info.year}</li>
		{/if}
		{#if info.age}
			<li>{info.age} years old</li>
		{/if}
	</ul>
{/await}

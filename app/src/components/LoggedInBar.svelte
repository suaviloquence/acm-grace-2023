<script lang="ts">
	import { user, path } from "../stores";

	let username = localStorage.getItem("username");
	if (!username) {
		logOut();
	}

	let info_pms = fetch("/api/user/me")
		.then((res) => res.json())
		.then((json) => {
			$user = json;
		})
		.catch(logOut);

	async function logOut() {
		await fetch("/api/logout");
		localStorage.removeItem("username");
		$path = "/";
	}
</script>

<div>
	{#await info_pms}
		Loading user…
	{:then}
		Hello, {$user.name}
	{/await}
	<button on:click={() => ($path = "/dashboard")}>Dashboard</button>
	<button on:click={() => ($path = "/settings")}>Settings</button>
	<button on:click={logOut}>Log out</button>
</div>

<script lang="ts">
	import { path } from "../stores";
	import { getUsernameCookie } from "../util";

	let username = getUsernameCookie();
	if (!username) {
		$path = "/";
	}

	let info_pms = fetch("/api/user/me")
		.then((res) => res.json())
		.catch(logOut);

	async function logOut() {
		await fetch("/api/logout");
		localStorage.removeItem("username");
		$path = "/";
	}
</script>

<button on:click={logOut}>Log out</button>

{#await info_pms}
	Loading user info...
{:then info}
	<h2>Hello, {info.name}</h2>
{/await}

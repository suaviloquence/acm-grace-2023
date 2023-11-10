<script lang="ts">
	import { path } from "../stores";

	let username: string;
	let password: string;

	async function login() {
		let res = await fetch("/api/login", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		let json = await res.json();
		if ("error" in json) {
			alert("Error: " + json["error"]);
			return;
		}
		if ("success" in json) {
			document.cookie = `username=${username.toLowerCase()}`;
			$path = "/dashboard";
		}
	}
</script>

<form on:submit|preventDefault={login}>
	<div>
		<label for="username">Username: </label>
		<input type="text" required bind:value={username} id="username" />
	</div>
	<div>
		<label for="password">Password: </label>
		<input type="password" required bind:value={password} id="password" />
	</div>
	<input type="submit" value="Log in" />
</form>

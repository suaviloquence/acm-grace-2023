<script lang="ts">
	import { path } from "../stores";
	import { getUsernameCookie } from "../util";

	let username: string;
	let password: string;

	if (getUsernameCookie()) {
		$path = "/dashboard";
	}

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
		if ("username" in json) {
			localStorage.setItem("username", json["username"]);
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
	<button on:click={() => ($path = "/signup")}>or sign up</button>
</form>

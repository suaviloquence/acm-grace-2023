<script lang="ts">
	import { path } from "../stores";

	let username: string;
	let password: string;
	let name: string;
	let age: number;
	let year: number;

	async function createUser() {
		let res = await fetch(`/api/user`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
				name,
				age,
				year,
			}),
		});

		let json = await res.json();
		if (json.success) {
			$path = "/login";
		}
	}
</script>

<form on:submit|preventDefault={createUser}>
	<div>
		<label for="username">Username: </label>
		<input type="text" required bind:value={username} id="username" />
	</div>
	<div>
		<label for="password">Password: </label>
		<input type="password" required bind:value={password} id="password" />
	</div>
	<div>
		<label for="name">Name: </label>
		<input type="text" required bind:value={name} id="name" />
	</div>
	<div>
		<label for="age">Age: </label>
		<input type="number" bind:value={age} id="age" />
	</div>
	<div>
		<label for="year">Year: </label>
		<input type="number" bind:value={year} id="year" />
	</div>
	<input type="submit" value="Sign up" />
</form>

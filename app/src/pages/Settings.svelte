<script lang="ts">
	import LoggedInBar from "../components/LoggedInBar.svelte";
	import { user, path } from "../stores";

	let name: string;
	let pronouns: string;
	let age: number;
	let year: number;

	function upd8(u) {
		if (u) {
			name = u.name;
			pronouns = u.pronouns;
			age = u.age;
			year = u.year;
		}
	}

	$: upd8($user);

	async function update() {
		let res = await fetch("/api/user", {
			method: "PUT",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name,
				pronouns,
				age,
				year,
			}),
		});
		$user = await res.json();
	}
</script>

<LoggedInBar />

{#if $user}
	<form on:submit|preventDefault={update}>
		<div>
			<label for="name">Name: </label>
			<input type="text" id="name" required bind:value={name} />
		</div>
		<div>
			<label for="pronouns">Pronouns: </label>
			<input type="text" id="pronouns" bind:value={pronouns} />
		</div>
		<div>
			<label for="age">Age: </label>
			<input type="text" id="age" bind:value={age} />
		</div>
		<div>
			<label for="year">Year: </label>
			<input type="text" id="year" bind:value={year} />
		</div>
		<input type="submit" value="Update" />
	</form>
{/if}

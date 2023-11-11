<script lang="ts">
	import LoggedInBar from "../components/LoggedInBar.svelte";
	import { user, path } from "../stores";

	let selected = new Date();

	async function updateCalendar(date: Date) {
		// TODO
	}

	$: updateCalendar(selected);
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
<h3>{selected.toLocaleString("default", { month: "long" })}</h3>
<table id="calendar">
	<thead>
		<th>Sun</th>
		<th>Mon</th>
		<th>Tue</th>
		<th>Wed</th>
		<th>Thu</th>
		<th>Fri</th>
		<th>Sat</th>
	</thead>
	<body> <tr /></body>
</table>

<style>
	#calendar {
		width: 100%;
	}
</style>

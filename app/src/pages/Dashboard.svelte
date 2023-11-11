<script lang="ts">
	import LoggedInBar from "../components/LoggedInBar.svelte";
	import { user, path } from "../stores";
	import type { Event } from "../models/events";

	let selected = new Date();
	selected.setHours(0);
	selected.setMinutes(0);
	selected.setSeconds(0);
	selected.setMilliseconds(0);
	selected = selected;

	interface CalendarDate {
		month?: string;
		day: number;
		events: Event[];
		date: Date;
	}

	let events: Event[];
	let showPopup = false;

	let weeks: CalendarDate[][] = [];
	let start: Date;
	let end: Date;

	async function updateCalendar(date: Date) {
		weeks = [];
		let week = [];
		let first = new Date(date);
		first.setDate(1);
		let prevs = first.getDay();
		let buffer;
		while (prevs > 0) {
			buffer = new Date(first.getTime() - 86400 * 1000 * prevs);
			week.push({
				month: buffer.toLocaleDateString("default", { month: "short" }),
				day: buffer.getDate(),
				events: [],
				date: buffer,
			});
			prevs--;
		}
		start = buffer;
		buffer = new Date(first);
		while (buffer.getMonth() == first.getMonth()) {
			week.push({
				day: buffer.getDate(),
				events: [],
				date: buffer,
			});
			buffer = new Date(buffer.getTime() + 86400 * 1000);
			if (week.length === 7) {
				weeks.push(week);
				week = [];
			}
		}
		if (week.length > 0) {
			while (week.length < 7) {
				week.push({
					month: buffer.toLocaleDateString("default", {
						month: "short",
					}),
					day: buffer.getDate(),
					events: [],
					date: buffer,
				});
				buffer = new Date(buffer.getTime() + 86400 * 1000);
			}
			weeks.push(week);
		}
		end = buffer;
	}

	fetch(`/api/user/me/events`)
		.then((res) => res.json())
		.then((evt) => {
			events = evt;
		});

	$: console.dir(events);
	$: if (events) {
		for (const week of weeks) {
			for (const day of week) {
				day.events = [];
			}
		}
		for (const evt of events) {
			if (evt.start <= start.getTime() || evt.start >= end.getTime())
				continue;

			for (const week of weeks) {
				for (const day of week) {
					if (
						evt.start >= day.date.getTime() &&
						evt.start < day.date.getTime() + 86400 * 1000
					) {
						day.events = [...day.events, evt];
					}
				}
			}
		}
		weeks = weeks;
	}

	function select(day: CalendarDate) {
		selected = day.date;
	}

	let name: string;
	let location_lat: number;
	let location_lon: number;
	let start_time = "";
	let end_time = "";

	async function addEvent() {
		let res = await fetch(`/api/event`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name,
				start:
					selected.getTime() +
					Number.parseInt(start_time.split(":")[0]) * 60 * 60 * 1000 +
					Number.parseInt(start_time.split(":")[1]) * 60 * 1000,
				end:
					selected.getTime() +
					Number.parseInt(end_time.split(":")[0]) * 60 * 60 * 1000 +
					Number.parseInt(end_time.split(":")[1]) * 60 * 1000,
				location_lat,
				location_lon,
			}),
		});
		let evt = await res.json();
		events = [...events, evt];
		showPopup = false;
	}

	async function deleteEvent(evt: Event) {
		if (!confirm("Are you sure you want to delete this event?")) return;
		await fetch(`/api/event/${evt.id}`, {
			method: "DELETE",
		});
		events = events.filter((e) => e != evt);
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
<h3>
	<button
		on:click={() => {
			selected.setDate(1);
			if (selected.getMonth() === 0) {
				selected.setFullYear(selected.getFullYear() - 1);
			}
			selected.setMonth((selected.getMonth() + 11) % 12);
			selected = selected;
		}}>←</button
	>
	{selected.toLocaleString("default", { month: "long" })}
	<button
		on:click={() => {
			selected.setDate(1);
			if (selected.getMonth() === 11) {
				selected.setFullYear(selected.getFullYear() + 1);
			}
			selected.setMonth((selected.getMonth() + 1) % 12);
			selected = selected;
		}}>→</button
	>
</h3>
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
	<tbody>
		{#each weeks as week}
			<tr>
				{#each week as day}
					<td
						><h4>
							<button on:click={() => select(day)}>
								{#if day.month}{day.month} {/if}
								{day.day}
							</button>
						</h4>
						<ul>
							{#each day.events as evt}
								<li>
									<h5>{evt.eventName} ({evt.owner})</h5>
									<button
										on:click={() =>
											($path = `/event/${evt.id}`)}
										>View</button
									>
									<button
										on:click={() =>
											($path = `/event/${evt.id}/edit`)}
										>Edit</button
									>
									<button on:click={() => deleteEvent(evt)}
										>Delete</button
									>
									<div>
										{new Date(evt.start).toLocaleString(
											"default",
											{
												hour: "numeric",
												minute: "numeric",
											}
										)}—{new Date(evt.end).toLocaleString(
											"default",
											{
												hour: "numeric",
												minute: "numeric",
											}
										)}
									</div>
								</li>
							{/each}
						</ul>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
<div>
	<h3>
		{selected.toLocaleDateString("default", {
			month: "long",
			day: "numeric",
		})}
		<button on:click={() => (showPopup = true)} disabled={showPopup}
			>+</button
		>
	</h3>
	{#if showPopup}
		<div id="popup">
			<form on:submit|preventDefault={addEvent}>
				<div>
					<label for="name">Name: </label>
					<input type="text" id="name" bind:value={name} />
				</div>
				<div>
					<label for="start">Time: </label>
					<input type="time" id="start" bind:value={start_time} />
				</div>
				<div>
					<label for="end">Time: </label>
					<input type="time" id="end" bind:value={end_time} />
				</div>
				<div>
					<label for="lat">Latitude: </label>
					<input type="number" id="lat" bind:value={location_lat} />
				</div>
				<div>
					<label for="lon">Longitude: </label>
					<input type="number" id="lon" bind:value={location_lon} />
				</div>
				<input type="submit" value="Create" />
			</form>
		</div>
	{/if}
</div>

<style>
	#calendar {
		width: 100%;
	}
</style>

<script lang="ts">
	import LoggedInBar from "../components/LoggedInBar.svelte";
	import type { Event as EventM } from "../models/events";
	import { path, user } from "../stores";

	let edit = false;

	let eventName: string;
	let owner: string;
	let start: number;
	let end: number;
	let location_lat: number;
	let location_lon: number;

	let day: Date;

	let start_time: string;
	let end_time: string;

	let username: string;

	export let id: number;
	let info_pms = reload();
	let photo_ids: number[] = [];

	let invitees: string[] = [];
	let attendees: string[] = [];
	async function reload() {
		await fetch(`/api/event/${id}`)
			.then((res) => res.json())
			.then((json: EventM) => {
				eventName = json.eventName;
				owner = json.owner;
				start = json.start;
				end = json.end;
				location_lat = json.location_lat;
				location_lon = json.location_lon;
				day = new Date(start);
				day.setHours(0);
				day.setMinutes(0);
				start_time = new Date(start).toLocaleString("default", {
					hour: "numeric",
					minute: "numeric",
				});
				end_time = new Date(start).toLocaleString("default", {
					hour: "numeric",
					minute: "numeric",
				});
			});
		attendees = await (await fetch(`/api/event/${id}/users`)).json();
		invitees = await (await fetch(`/api/event/${id}/invitees`)).json();

		let res = await fetch(`/api/event/${id}/photos`);
		photo_ids = await res.json();
	}

	async function deleteEvent() {
		if (!confirm("Are you sure you want to delete this event?")) return;
		await fetch(`/api/event/${id}`, {
			method: "DELETE",
		});
		$path = "/dashboard";
	}

	async function revokeInvite(invitee: string) {
		if (!confirm("Are you sure you want to revoke the invite?")) return;
		await fetch(`/api/event/${id}/users/${invitee}`, { method: "DELETE" });
		invitees = await (await fetch(`/api/event/${id}/invitees`)).json();
	}

	async function acceptInvite() {
		await fetch(`/api/event/${id}/users`, { method: "PUT" });
		attendees = await (await fetch(`/api/event/${id}/users`)).json();
		invitees = await (await fetch(`/api/event/${id}/invitees`)).json();
	}

	async function updateEvent() {
		await fetch(`/api/event/${id}`, {
			method: "PUT",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				eventName,
				owner,
				location_lat,
				location_lon,
				start:
					day.getTime() +
					Number.parseInt(start_time.split(":")[0]) * 60 * 60 * 1000 +
					Number.parseInt(start_time.split(":")[1]) * 60 * 1000,
				end:
					day.getTime() +
					Number.parseInt(end_time.split(":")[0]) * 60 * 60 * 1000 +
					Number.parseInt(end_time.split(":")[1]) * 60 * 1000,
			}),
		});
		reload();
	}

	async function invite() {
		if (username === owner) return alert("Cannot invite the owner!");
		let res = await fetch(`/api/event/${id}/users/${username}`, {
			method: "POST",
		});
		let { success } = await res.json();
		if (success) alert("success");
		username = "";
		invitees = await (await fetch(`/api/event/${id}/invitees`)).json();
	}

	let images: FileList;
	async function addPhoto() {
		for (const file of images) {
			const data = await file.arrayBuffer();
			await fetch(`/api/event/${id}/photos`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					data: btoa(String.fromCharCode(...new Uint8Array(data))),
				}),
			});
		}
		let res = await fetch(`/api/event/${id}/photos`);
		photo_ids = await res.json();
	}

	async function deletePhoto(pid: number) {
		if (!confirm("Are you sure you want to delete?")) return;
		await fetch(`/api/event/${id}/photos/${pid}`, { method: "DELETE" });
		let res = await fetch(`/api/event/${id}/photos`);
		photo_ids = await res.json();
	}

	async function leaveEvent() {
		if (!confirm("Are you sure you want to leave this event?")) return;
		await fetch(`/api/event/${id}/users/me`, { method: "DELETE" });
		$path = "/dashboard";
	}
</script>

<LoggedInBar />
{#await info_pms}
	Loading event…
{:then _}
	<h2>{eventName}</h2>
	<button on:click={() => (edit = true)}>Edit</button>
	<button on:click={deleteEvent}>Delete</button>
	<h3>Owned by <a href="/user/{owner}">{owner}</a></h3>
	<h4>At ({location_lat.toFixed(6)}, {location_lon.toFixed(6)})</h4>
	<div>
		{new Date(start).toLocaleString("default", {
			hour: "numeric",
			minute: "numeric",
		})}—{new Date(end).toLocaleString("default", {
			hour: "numeric",
			minute: "numeric",
		})}
	</div>
	<h3>Attendees</h3>
	<ul>
		{#each attendees as attendee}
			<li>
				{attendee}
				{#if attendee === $user.username}<button on:click={leaveEvent}
						>Leave</button
					>{/if}
			</li>
		{/each}
		{#each invitees as invitee}
			<li>
				{invitee} (invited)
				{#if invitee === $user.username}
					<button on:click={acceptInvite}>Accept</button>
					<button on:click={() => revokeInvite(invitee)}
						>Decline</button
					>
				{:else}
					<button on:click={() => revokeInvite(invitee)}
						>Revoke</button
					>
				{/if}
			</li>
		{/each}
	</ul>
	<div>
		<label for="invite">Invite user: </label>
		<input type="text" required id="invite" bind:value={username} />
		<button on:click={invite}>Send</button>
	</div>
	<h3>Photos</h3>
	<div>
		{#each photo_ids as pid}
			<div class="photo">
				<img alt="Photo id {pid}" src="/api/event/{id}/photos/{pid}" />
				<button on:click={() => deletePhoto(pid)}>Delete</button>
			</div>
		{/each}
		<form on:submit|preventDefault={addPhoto}>
			<input type="file" accept=".png" bind:files={images} />
			<input type="submit" value="Upload" />
		</form>
	</div>
	{#if edit}
		<form on:submit|preventDefault={() => updateEvent()}>
			<div>
				<label for="name">Name: </label>
				<input type="text" id="name" bind:value={eventName} />
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
				<input
					type="number"
					id="lat"
					bind:value={location_lat}
					step="any"
				/>
			</div>
			<div>
				<label for="lon">Longitude: </label>
				<input
					type="number"
					id="lon"
					bind:value={location_lon}
					step="any"
				/>
			</div>
			<input type="submit" value="Create" />
		</form>
	{/if}
{/await}

<style>
	.photo img {
		max-width: 600px;
		max-height: 600px;
	}
</style>

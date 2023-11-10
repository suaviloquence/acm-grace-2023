import { writable, type Readable, type Writable, readable } from "svelte/store";

export const path: Writable<string> = writable(window.location.pathname)
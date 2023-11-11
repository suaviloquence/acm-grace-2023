import { writable, type Readable, type Writable, readable } from "svelte/store";
import type { User } from "./models/user";

export const path: Writable<string> = writable(window.location.pathname)
export const user: Writable<User> = writable(null);
import { writable } from "svelte/store";

export const activeCard = writable<HTMLElement | undefined>(undefined);

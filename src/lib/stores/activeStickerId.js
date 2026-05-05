import { writable } from "svelte/store";

// The id of the currently "expanded/active" card, if any.
// Used for UI affordances like the homepage "inspect" button.
/** @type {import("svelte/store").Writable<string | undefined>} */
export const activeStickerId = writable(undefined);
